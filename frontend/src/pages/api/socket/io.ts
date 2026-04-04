import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import dbConnect from '@/lib/db/connect';
import Message from '@/lib/models/Message';
import { checkRateLimit } from '@/lib/utils/rateLimit';

export const config = {
    api: {
        bodyParser: false,
    },
};

/** Strip HTML tags & enforce max character length */
function sanitizeMessage(input: string): string {
    return input
        .replace(/<[^>]*>/g, '')          // strip HTML tags
        .replace(/[\u0000-\u001F]/g, ' ') // strip control characters
        .trim()
        .slice(0, 2000);                  // hard cap at 2000 chars
}

/** Serialize a Mongoose message document to plain JSON */
function serializeMessage(doc: any) {
    return {
        _id: doc._id?.toString?.() ?? doc._id,
        roomId: doc.roomId,
        senderId: doc.senderId,
        senderName: doc.senderName,
        message: doc.message,
        timestamp: doc.timestamp ?? doc.createdAt ?? new Date(),
        isRead: doc.isRead ?? false,
        readAt: doc.readAt,
    };
}

// ── Global Socket state for HMR Persistence ────────────────────────────────
declare global {
    var _userSockets: Map<string, Set<string>> | undefined;
    var _socketUser: Map<string, string> | undefined;
    var _socketRooms: Map<string, Set<string>> | undefined;
}

const userSockets = global._userSockets || new Map<string, Set<string>>();
const socketUser = global._socketUser || new Map<string, string>();
const socketRooms = global._socketRooms || new Map<string, Set<string>>();

if (process.env.NODE_ENV === 'development') {
    global._userSockets = userSockets;
    global._socketUser = socketUser;
    global._socketRooms = socketRooms;
}

const ioHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (!(res.socket as any).server.io) {
        console.log('[Socket.IO] Initializing server...');

        const path = '/api/socket/io';
        const httpServer: NetServer = (res.socket as any).server;

        const io = new ServerIO(httpServer, {
            path,
            addTrailingSlash: false,
            pingTimeout: 60000,
            pingInterval: 25000,
            transports: ['polling', 'websocket'],
            cors: {
                origin: process.env.NEXT_PUBLIC_APP_URL ?? '*',
                methods: ['GET', 'POST'],
            },
        });

        (res.socket as any).server.io = io;

        io.on('connection', (socket) => {
            console.log('[Socket.IO] New connection:', socket.id);

            // ── Register user presence ────────────────────────────────────────
            socket.on('user-online', (userId: string) => {
                if (!userId) return;
                socketUser.set(socket.id, userId);
                if (!userSockets.has(userId)) userSockets.set(userId, new Set());
                userSockets.get(userId)!.add(socket.id);
                io.emit('user-status', { userId, status: 'online' });
            });

            // ── Join a room ───────────────────────────────────────────────────
            socket.on('join-room', (roomId: string) => {
                if (!roomId) return;
                socket.join(roomId);
                if (!socketRooms.has(socket.id)) socketRooms.set(socket.id, new Set());
                socketRooms.get(socket.id)!.add(roomId);
                console.log(`[Socket.IO] ${socket.id} joined room: ${roomId}`);
            });

            // ── Send message ──────────────────────────────────────────────────
            socket.on('send-message', async (data: any) => {
                const { roomId, senderId, senderName, message, recipientId } = data;

                if (!roomId || !senderId || !message?.trim()) {
                    socket.emit('error', { message: 'Invalid payload' });
                    return;
                }

                // Rate limit
                const rl = checkRateLimit(`msg:${senderId}`, 20, 60_000);
                if (!rl.allowed) return;

                const clean = sanitizeMessage(message);
                if (!clean) return;

                try {
                    await dbConnect();
                    
                    // Check if recipient is CURRENTLY in the room (auto-read)
                    let isRead = false;
                    if (recipientId) {
                        const recipientSockets = userSockets.get(recipientId);
                        if (recipientSockets) {
                            for (const sid of recipientSockets) {
                                const rooms = socketRooms.get(sid);
                                if (rooms?.has(roomId)) {
                                    isRead = true;
                                    break;
                                }
                            }
                        }
                    }

                    const newMessage = await Message.create({
                        roomId,
                        senderId,
                        senderName,
                        message: clean,
                        isRead: isRead,
                        readAt: isRead ? new Date() : undefined
                    });

                    const payload = serializeMessage(newMessage);
                    io.to(roomId).emit('receive-message', payload);

                    // PUSH notifications for offline/backgrounded recipients
                    if (recipientId && !isRead) {
                        const recipientSocketIds = userSockets.get(recipientId);
                        if (recipientSocketIds) {
                            for (const sid of recipientSocketIds) {
                                const rooms = socketRooms.get(sid);
                                if (!rooms?.has(roomId)) {
                                    io.to(sid).emit('notification', {
                                        type: 'new-message',
                                        roomId,
                                        senderName,
                                        preview: clean.slice(0, 60),
                                    });
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('[Socket.IO] Send Error:', error);
                    socket.emit('error', { message: 'Failed to send' });
                }
            });

            // ── MARK MESSAGES AS READ ─────────────────────────────────────────
            socket.on('mark-as-read', async (data: { roomId: string, userId: string }) => {
                const { roomId, userId } = data;
                if (!roomId || !userId) return;

                try {
                    await dbConnect();
                    // Mark all messages in room sent to ME as read
                    const result = await Message.updateMany(
                        { roomId, senderId: { $ne: userId }, isRead: false },
                        { $set: { isRead: true, readAt: new Date() } }
                    );

                    if (result.modifiedCount > 0) {
                        // Broadcast to everyone in room that messages are now "Seen"
                        io.to(roomId).emit('messages-seen', { roomId, readBy: userId, at: new Date() });
                    }
                } catch (error) {
                    console.error('[Socket.IO] Mark as read error:', error);
                }
            });

            socket.on('disconnect', (reason) => {
                const userId = socketUser.get(socket.id);
                if (userId) {
                    const sockets = userSockets.get(userId);
                    if (sockets) {
                        sockets.delete(socket.id);
                        if (sockets.size === 0) {
                            userSockets.delete(userId);
                            io.emit('user-status', { userId, status: 'offline' });
                        }
                    }
                    socketUser.delete(socket.id);
                }
                socketRooms.delete(socket.id);
                console.log(`[Socket.IO] Disconnected (${reason}):`, socket.id);
            });
        });
    }

    res.end();
};

export default ioHandler;
