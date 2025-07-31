"use strict";
/**
 * Chat history management routes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const db_1 = __importDefault(require("../src/db"));
const router = (0, express_1.Router)();
// Get all conversations for the user
router.get('/conversations', auth_middleware_1.default, async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversations = await (0, db_1.default)('chat_conversations')
            .where({ user_id: userId })
            .orderBy('last_message_at', 'desc')
            .select('id', 'title', 'started_at', 'last_message_at');
        // Get message count and preview for each conversation
        const conversationsWithDetails = await Promise.all(conversations.map(async (conv) => {
            const messageCount = await (0, db_1.default)('chat_messages')
                .where({ conversation_id: conv.id })
                .count('id as count')
                .first();
            const lastMessage = await (0, db_1.default)('chat_messages')
                .where({ conversation_id: conv.id })
                .orderBy('created_at', 'desc')
                .select('content', 'role')
                .first();
            return {
                ...conv,
                messageCount: messageCount?.count || 0,
                preview: lastMessage ? lastMessage.content.substring(0, 100) + '...' : '',
                lastMessageRole: lastMessage?.role
            };
        }));
        res.json(conversationsWithDetails);
    }
    catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});
// Get messages for a specific conversation
router.get('/conversations/:id/messages', auth_middleware_1.default, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id);
        const userId = req.user.userId;
        // Verify user owns this conversation
        const conversation = await (0, db_1.default)('chat_conversations')
            .where({ id: conversationId, user_id: userId })
            .first();
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        const messages = await (0, db_1.default)('chat_messages')
            .where({ conversation_id: conversationId })
            .orderBy('created_at', 'asc')
            .select('id', 'role', 'content', 'metadata', 'created_at');
        res.json({
            conversation,
            messages
        });
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
// Create or update conversation with new message
router.post('/conversations', auth_middleware_1.default, async (req, res) => {
    try {
        const { conversationId, message, isNewConversation } = req.body;
        const userId = req.user.userId;
        let convId = conversationId;
        // Create new conversation if needed
        if (isNewConversation || !conversationId) {
            const [newConvId] = await (0, db_1.default)('chat_conversations').insert({
                user_id: userId,
                title: message.content.substring(0, 50) + '...', // Use first message as title
                started_at: new Date().toISOString(),
                last_message_at: new Date().toISOString()
            });
            convId = newConvId;
        }
        else {
            // Update last message time
            await (0, db_1.default)('chat_conversations')
                .where({ id: conversationId, user_id: userId })
                .update({ last_message_at: new Date().toISOString() });
        }
        // Insert the message
        await (0, db_1.default)('chat_messages').insert({
            conversation_id: convId,
            role: message.role,
            content: message.content,
            metadata: JSON.stringify(message.metadata || {}),
            created_at: new Date().toISOString()
        });
        res.json({ conversationId: convId });
    }
    catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({ error: 'Failed to save message' });
    }
});
// Delete a conversation
router.delete('/conversations/:id', auth_middleware_1.default, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id);
        const userId = req.user.userId;
        const deleted = await (0, db_1.default)('chat_conversations')
            .where({ id: conversationId, user_id: userId })
            .delete();
        if (!deleted) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});
// Update conversation title
router.patch('/conversations/:id', auth_middleware_1.default, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id);
        const { title } = req.body;
        const userId = req.user.userId;
        const updated = await (0, db_1.default)('chat_conversations')
            .where({ id: conversationId, user_id: userId })
            .update({ title });
        if (!updated) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Update conversation error:', error);
        res.status(500).json({ error: 'Failed to update conversation' });
    }
});
exports.default = router;
//# sourceMappingURL=chat-history.routes.js.map