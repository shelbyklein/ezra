"use strict";
/**
 * Attachment CRUD endpoints for managing task attachments
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const db_1 = __importDefault(require("../src/db"));
const router = express_1.default.Router();
// Get all attachments for a task
router.get('/task/:taskId', auth_middleware_1.default, async (req, res) => {
    try {
        // Verify the task belongs to the user
        const task = await (0, db_1.default)('tasks')
            .join('projects', 'tasks.project_id', 'projects.id')
            .where({
            'tasks.id': req.params.taskId,
            'projects.user_id': req.user.userId
        })
            .select('tasks.id')
            .first();
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        // Get attachments for the task
        const attachments = await (0, db_1.default)('attachments')
            .where({ task_id: req.params.taskId })
            .orderBy('created_at', 'desc');
        res.json(attachments);
    }
    catch (error) {
        console.error('Error fetching attachments:', error);
        res.status(500).json({ error: 'Failed to fetch attachments' });
    }
});
// Create a new attachment
router.post('/', auth_middleware_1.default, async (req, res) => {
    try {
        const { task_id, type, name, content, mime_type, size, metadata } = req.body;
        if (!task_id || !type || !name || !content) {
            return res.status(400).json({
                error: 'task_id, type, name, and content are required'
            });
        }
        // Validate type
        if (!['file', 'url', 'note'].includes(type)) {
            return res.status(400).json({
                error: 'Type must be one of: file, url, note'
            });
        }
        // Verify the task belongs to the user
        const task = await (0, db_1.default)('tasks')
            .join('projects', 'tasks.project_id', 'projects.id')
            .where({
            'tasks.id': task_id,
            'projects.user_id': req.user.userId
        })
            .select('tasks.id')
            .first();
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        // Create the attachment
        const attachment = {
            task_id,
            type,
            name,
            content,
            mime_type: mime_type || null,
            size: size || null,
            metadata: metadata ? JSON.stringify(metadata) : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await (0, db_1.default)('attachments').insert(attachment);
        // Fetch the created attachment
        const createdAttachment = await (0, db_1.default)('attachments')
            .where({ task_id })
            .orderBy('id', 'desc')
            .first();
        res.status(201).json(createdAttachment);
    }
    catch (error) {
        console.error('Error creating attachment:', error);
        res.status(500).json({ error: 'Failed to create attachment' });
    }
});
// Update an attachment
router.put('/:id', auth_middleware_1.default, async (req, res) => {
    try {
        const { name, content, metadata } = req.body;
        // Verify the attachment belongs to the user
        const attachment = await (0, db_1.default)('attachments as a')
            .join('tasks as t', 'a.task_id', 't.id')
            .join('projects as p', 't.project_id', 'p.id')
            .where({
            'a.id': req.params.id,
            'p.user_id': req.user.userId
        })
            .select('a.*')
            .first();
        if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
        }
        const updateData = {
            updated_at: new Date().toISOString()
        };
        if (name !== undefined)
            updateData.name = name;
        if (content !== undefined)
            updateData.content = content;
        if (metadata !== undefined)
            updateData.metadata = JSON.stringify(metadata);
        await (0, db_1.default)('attachments')
            .where({ id: req.params.id })
            .update(updateData);
        const updatedAttachment = await (0, db_1.default)('attachments')
            .where({ id: req.params.id })
            .first();
        res.json(updatedAttachment);
    }
    catch (error) {
        console.error('Error updating attachment:', error);
        res.status(500).json({ error: 'Failed to update attachment' });
    }
});
// Delete an attachment
router.delete('/:id', auth_middleware_1.default, async (req, res) => {
    try {
        // Verify the attachment belongs to the user
        const attachment = await (0, db_1.default)('attachments as a')
            .join('tasks as t', 'a.task_id', 't.id')
            .join('projects as p', 't.project_id', 'p.id')
            .where({
            'a.id': req.params.id,
            'p.user_id': req.user.userId
        })
            .select('a.id')
            .first();
        if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
        }
        await (0, db_1.default)('attachments')
            .where({ id: req.params.id })
            .delete();
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting attachment:', error);
        res.status(500).json({ error: 'Failed to delete attachment' });
    }
});
exports.default = router;
//# sourceMappingURL=attachments.routes.js.map