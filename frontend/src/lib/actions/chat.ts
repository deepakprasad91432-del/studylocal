'use server';

import dbConnect from '@/lib/db/connect';
import Message from '@/lib/models/Message';
import { getCache, setCache } from '@/lib/cache';

const MESSAGES_TTL = 30; // seconds — short TTL for near-real-time feel

export async function getMessages(roomId: string) {
    if (!roomId) return [];

    const cacheKey = `messages:${roomId}`;

    // 1. Try cache first
    const cached = await getCache<ReturnType<typeof serializeMessages>>(cacheKey);
    if (cached) return cached;

    // 2. Fallback to MongoDB
    try {
        await dbConnect();
        // Log query for server debugging
        console.log(`[Chat] Querying MongoDB for roomId: "${roomId}"`);

        const messages = await Message.find({ roomId }).sort({ timestamp: 1 }).lean();
        const result = serializeMessages(messages);

        console.log(`[Chat] Found ${messages.length} existing messages for roomId: "${roomId}"`);

        // 3. Seed cache
        await setCache(cacheKey, result, MESSAGES_TTL);
        return result;
    } catch (error) {
        console.error('[chat] Error fetching messages:', error);
        return [];
    }
}

function serializeMessages(messages: any[]) {
    return messages.map((msg: any) => ({
        _id: msg._id.toString(),
        roomId: msg.roomId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        message: msg.message,
        timestamp: msg.timestamp,
    }));
}
