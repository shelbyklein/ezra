"use strict";
/**
 * Tag CRUD endpoints for task organization
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const db_1 = __importDefault(require("../src/db"));
const router = express_1.default.Router();
// Get all tags for authenticated user
router.get('/', auth_middleware_1.default, async (req, res) => {
    try {
        const tags = await (0, db_1.default)('tags')
            .where({ user_id: req.user.userId })
            .orderBy('name', 'asc');
        res.json(tags);
    }
    catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});
// Create new tag
router.post('/', auth_middleware_1.default, async (req, res) => {
    try {
        const { name, color } = req.body;
        if (!name || !color) {
            return res.status(400).json({ error: 'Tag name and color are required' });
        }
        // Validate color format
        if (!/^#[0-9A-F]{6}$/i.test(color)) {
            return res.status(400).json({ error: 'Invalid color format. Use hex format like #3182CE' });
        }
        const tag = {
            user_id: req.user.userId,
            name: name.trim(),
            color,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        try {
            await (0, db_1.default)('tags').insert(tag);
            // Fetch the created tag
            const createdTag = await (0, db_1.default)('tags')
                .where({ user_id: req.user.userId, name: tag.name })
                .first();
            res.status(201).json(createdTag);
        }
        catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'A tag with this name already exists' });
            }
            throw error;
        }
    }
    catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({ error: 'Failed to create tag' });
    }
});
// Update tag
router.put('/:id', auth_middleware_1.default, async (req, res) => {
    try {
        const { name, color } = req.body;
        // Validate color format if provided
        if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
            return res.status(400).json({ error: 'Invalid color format. Use hex format like #3182CE' });
        }
        const updateData = {
            updated_at: new Date().toISOString()
        };
        if (name !== undefined)
            updateData.name = name.trim();
        if (color !== undefined)
            updateData.color = color;
        const updated = await (0, db_1.default)('tags')
            .where({
            id: req.params.id,
            user_id: req.user.userId
        })
            .update(updateData);
        if (!updated) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        const tag = await (0, db_1.default)('tags')
            .where({ id: req.params.id })
            .first();
        res.json(tag);
    }
    catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ error: 'A tag with this name already exists' });
        }
        console.error('Error updating tag:', error);
        res.status(500).json({ error: 'Failed to update tag' });
    }
});
// Delete tag
router.delete('/:id', auth_middleware_1.default, async (req, res) => {
    try {
        // First remove all associations in task_tags
        await (0, db_1.default)('task_tags')
            .where({ tag_id: req.params.id })
            .delete();
        // Then delete the tag
        const deleted = await (0, db_1.default)('tags')
            .where({
            id: req.params.id,
            user_id: req.user.userId
        })
            .delete();
        if (!deleted) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).json({ error: 'Failed to delete tag' });
    }
});
// Get tags for a specific task
router.get('/task/:taskId', auth_middleware_1.default, async (req, res) => {
    try {
        // First verify the task belongs to the user
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
        // Get tags for the task
        const tags = await (0, db_1.default)('tags')
            .join('task_tags', 'tags.id', 'task_tags.tag_id')
            .where({ 'task_tags.task_id': req.params.taskId })
            .select('tags.*');
        res.json(tags);
    }
    catch (error) {
        console.error('Error fetching task tags:', error);
        res.status(500).json({ error: 'Failed to fetch task tags' });
    }
});
// Assign tags to a task
router.post('/task/:taskId', auth_middleware_1.default, async (req, res) => {
    try {
        const { tagIds } = req.body;
        if (!Array.isArray(tagIds)) {
            return res.status(400).json({ error: 'tagIds must be an array' });
        }
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
        // Verify all tags belong to the user
        const userTags = await (0, db_1.default)('tags')
            .where({ user_id: req.user.userId })
            .whereIn('id', tagIds)
            .pluck('id');
        if (userTags.length !== tagIds.length) {
            return res.status(400).json({ error: 'One or more tags not found' });
        }
        // Remove existing tags and add new ones
        await db_1.default.transaction(async (trx) => {
            await trx('task_tags')
                .where({ task_id: req.params.taskId })
                .delete();
            if (tagIds.length > 0) {
                const taskTags = tagIds.map(tagId => ({
                    task_id: parseInt(req.params.taskId),
                    tag_id: tagId
                }));
                await trx('task_tags').insert(taskTags);
            }
        });
        // Return updated tags
        const tags = await (0, db_1.default)('tags')
            .join('task_tags', 'tags.id', 'task_tags.tag_id')
            .where({ 'task_tags.task_id': req.params.taskId })
            .select('tags.*');
        res.json(tags);
    }
    catch (error) {
        console.error('Error assigning tags:', error);
        res.status(500).json({ error: 'Failed to assign tags' });
    }
});
// Get tags for a specific project
router.get('/project/:projectId', auth_middleware_1.default, async (req, res) => {
    try {
        // First verify the project belongs to the user
        const project = await (0, db_1.default)('projects')
            .where({
            id: req.params.projectId,
            user_id: req.user.userId
        })
            .first();
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Get tags for the project
        const tags = await (0, db_1.default)('tags')
            .join('project_tags', 'tags.id', 'project_tags.tag_id')
            .where({ 'project_tags.project_id': req.params.projectId })
            .select('tags.*');
        res.json(tags);
    }
    catch (error) {
        console.error('Error fetching project tags:', error);
        res.status(500).json({ error: 'Failed to fetch project tags' });
    }
});
// Assign tags to a project
router.post('/project/:projectId', auth_middleware_1.default, async (req, res) => {
    try {
        const { tagIds } = req.body;
        if (!Array.isArray(tagIds)) {
            return res.status(400).json({ error: 'tagIds must be an array' });
        }
        // Verify the project belongs to the user
        const project = await (0, db_1.default)('projects')
            .where({
            id: req.params.projectId,
            user_id: req.user.userId
        })
            .first();
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Verify all tags belong to the user
        const userTags = await (0, db_1.default)('tags')
            .where({ user_id: req.user.userId })
            .whereIn('id', tagIds)
            .pluck('id');
        if (userTags.length !== tagIds.length) {
            return res.status(400).json({ error: 'One or more tags not found' });
        }
        // Remove existing tags and add new ones
        await db_1.default.transaction(async (trx) => {
            await trx('project_tags')
                .where({ project_id: req.params.projectId })
                .delete();
            if (tagIds.length > 0) {
                const projectTags = tagIds.map(tagId => ({
                    project_id: parseInt(req.params.projectId),
                    tag_id: tagId
                }));
                await trx('project_tags').insert(projectTags);
            }
        });
        // Return updated tags
        const tags = await (0, db_1.default)('tags')
            .join('project_tags', 'tags.id', 'project_tags.tag_id')
            .where({ 'project_tags.project_id': req.params.projectId })
            .select('tags.*');
        res.json(tags);
    }
    catch (error) {
        console.error('Error assigning project tags:', error);
        res.status(500).json({ error: 'Failed to assign project tags' });
    }
});
exports.default = router;
//# sourceMappingURL=tags.routes.js.map