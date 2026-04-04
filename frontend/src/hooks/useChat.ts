import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';

export interface Message {
    _id?: string;
    roomId: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: Date;
    isRead?: boolean;
    readAt?: Date;
}

export const useChat = (
    roomId: string,
    userId: string,
    userName: string,
    initialMessages: Message[],
    recipientId?: string // Who are we talking to?
) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const router = useRouter();

    const hasSeeded = useRef<string | null>(null);

    useEffect(() => {
        if (hasSeeded.current !== roomId) {
            setMessages(initialMessages);
            hasSeeded.current = roomId;
        }
    }, [roomId, initialMessages]);

    // Helper to mark messages as read
    const markAsRead = useCallback(() => {
        if (socketRef.current?.connected && roomId && userId) {
            socketRef.current.emit('mark-as-read', { roomId, userId });
        }
    }, [roomId, userId]);

    useEffect(() => {
        if (!roomId || !userId) return;

        const SOCKET_INIT_URL = '/api/socket/io';
        let socket: Socket | null = null;

        const initSocket = async () => {
            try {
                await fetch(SOCKET_INIT_URL);

                socket = io({
                    path: SOCKET_INIT_URL,
                    addTrailingSlash: false,
                    transports: ['polling', 'websocket'],
                    reconnectionAttempts: 10,
                    reconnectionDelay: 2000,
                });

                socketRef.current = socket;

                socket.on('connect', () => {
                    console.log('[Chat] Socket connected');
                    setIsConnected(true);
                    socket?.emit('join-room', roomId);
                    socket?.emit('user-online', userId);
                    // Mark as read immediately on connect/join
                    socket?.emit('mark-as-read', { roomId, userId });
                });

                socket.on('disconnect', () => setIsConnected(false));

                socket.on('receive-message', (data: Message) => {
                    // If we are looking at the chat, mark this new message as read immediately
                    if (document.visibilityState === 'visible') {
                        socket?.emit('mark-as-read', { roomId, userId });
                    }

                    setMessages((prev) => {
                        // Optimistic replacement
                        if (data.senderId === userId) {
                            const tempIdx = prev.findIndex(m => m._id === `temp-${data.message}` || (!m._id && m.senderId === userId && m.message === data.message));
                            if (tempIdx !== -1) {
                                const next = [...prev];
                                next[tempIdx] = data;
                                return next;
                            }
                        }
                        if (data._id && prev.some(m => m._id === data._id)) return prev;
                        return [...prev, data];
                    });
                    
                    router.refresh();
                });

                // Handle "Seen" indicators from the other user
                socket.on('messages-seen', (data: { roomId: string, readBy: string }) => {
                    if (data.roomId === roomId && data.readBy !== userId) {
                        setMessages((prev) => prev.map(m => 
                            m.senderId === userId ? { ...m, isRead: true, readAt: new Date() } : m
                        ));
                    }
                });

                socket.on('message-deleted', (messageId: string) => {
                    setMessages((prev) => prev.filter((m) => m._id !== messageId));
                });

            } catch (err) {
                console.error('[Chat] Init failed:', err);
            }
        };

        const handleFocus = () => markAsRead();
        window.addEventListener('focus', handleFocus);

        initSocket();

        return () => {
            window.removeEventListener('focus', handleFocus);
            if (socket) socket.disconnect();
        };
    }, [roomId, userId, router, markAsRead]);

    const sendMessage = useCallback(
        async (msg: string) => {
            if (!msg.trim() || !socketRef.current?.connected) return;

            const optimisticMsg: Message = {
                _id: `temp-${Date.now()}`,
                roomId,
                senderId: userId,
                senderName: userName,
                message: msg,
                timestamp: new Date(),
                isRead: false
            };

            setMessages((prev) => [...prev, optimisticMsg]);

            socketRef.current.emit('send-message', {
                roomId,
                senderId: userId,
                senderName: userName,
                message: msg,
                recipientId,
            });
        },
        [roomId, userId, userName, recipientId]
    );

    const deleteMessage = useCallback(
        async (messageId: string) => {
            socketRef.current?.emit('delete-message', { roomId, messageId });
        },
        [roomId]
    );

    return {
        messages,
        sendMessage,
        deleteMessage,
        isConnected,
        markAsRead
    };
};
