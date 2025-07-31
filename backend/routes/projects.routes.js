"use strict";
/**
 * Project CRUD endpoints for managing kanban projects
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const db_1 = __importDefault(require("../src/db"));
const router = express_1.default.Router();
// Get recent projects for a user
router.get('/recent', auth_middleware_1.default, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const projects = await (0, db_1.default)('projects')
            .where({ user_id: req.user.userId })
            .orderBy('updated_at', 'desc')
            .limit(limit);
        // Get task counts for each project
        const projectIds = projects.map(p => p.id);
        const taskCounts = await (0, db_1.default)('tasks')
            .whereIn('project_id', projectIds)
            .groupBy('project_id')
            .select('project_id')
            .count('id as count');
        const taskCountMap = taskCounts.reduce((acc, tc) => {
            acc[tc.project_id] = parseInt(tc.count);
            return acc;
        }, {});
        // Get tags for each project
        const projectTags = await (0, db_1.default)('project_tags as pt')
            .join('tags as t', 'pt.tag_id', 't.id')
            .whereIn('pt.project_id', projectIds)
            .select('pt.project_id', 't.id', 't.name', 't.color');
        const tagsByProject = projectTags.reduce((acc, tag) => {
            if (!acc[tag.project_id]) {
                acc[tag.project_id] = [];
            }
            acc[tag.project_id].push({
                id: tag.id,
                name: tag.name,
                color: tag.color
            });
            return acc;
        }, {});
        const projectsWithDetails = projects.map(project => ({
            ...project,
            name: project.title, // Map database 'title' to frontend 'name'
            task_count: taskCountMap[project.id] || 0,
            tags: tagsByProject[project.id] || []
        }));
        res.json(projectsWithDetails);
    }
    catch (error) {
        console.error('Error fetching recent projects:', error);
        res.status(500).json({ error: 'Failed to fetch recent projects' });
    }
});
// Get all projects for authenticated user
router.get('/', auth_middleware_1.default, async (req, res) => {
    try {
        const projects = await (0, db_1.default)('projects')
            .where({ user_id: req.user.userId })
            .orderBy('created_at', 'desc');
        // Fetch tags for all projects
        const projectIds = projects.map(project => project.id);
        let projectTags = [];
        if (projectIds.length > 0) {
            projectTags = await (0, db_1.default)('project_tags as pt')
                .join('tags as t', 'pt.tag_id', 't.id')
                .whereIn('pt.project_id', projectIds)
                .select('pt.project_id', 't.id', 't.name', 't.color');
        }
        // Group tags by project
        const tagsByProject = projectTags.reduce((acc, tag) => {
            if (!acc[tag.project_id]) {
                acc[tag.project_id] = [];
            }
            acc[tag.project_id].push({
                id: tag.id,
                name: tag.name,
                color: tag.color
            });
            return acc;
        }, {});
        // Add tags to projects and map title to name
        const projectsWithTags = projects.map(project => ({
            ...project,
            name: project.title, // Map database 'title' to frontend 'name'
            tags: tagsByProject[project.id] || []
        }));
        res.json(projectsWithTags);
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});
// Get single project by ID
router.get('/:id', auth_middleware_1.default, async (req, res) => {
    try {
        const project = await (0, db_1.default)('projects')
            .where({
            id: req.params.id,
            user_id: req.user.userId
        })
            .first();
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Fetch tags for this project
        const projectTags = await (0, db_1.default)('project_tags as pt')
            .join('tags as t', 'pt.tag_id', 't.id')
            .where('pt.project_id', project.id)
            .select('t.id', 't.name', 't.color');
        res.json({
            ...project,
            name: project.title, // Map database 'title' to frontend 'name'
            tags: projectTags
        });
    }
    catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});
// Create new project
router.post('/', auth_middleware_1.default, async (req, res) => {
    try {
        const { name, description, color } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Project name is required' });
        }
        // Validate color format (hex)
        if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
            return res.status(400).json({ error: 'Invalid color format. Use hex format like #3182CE' });
        }
        const project = {
            user_id: req.user.userId,
            title: name, // Database uses 'title' not 'name'
            description: description || null,
            color: color || '#3182CE', // Default blue if not provided
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await (0, db_1.default)('projects').insert(project);
        // SQLite doesn't support returning clause properly, so we fetch the last inserted project
        const createdProject = await (0, db_1.default)('projects')
            .where({ user_id: req.user.userId })
            .orderBy('id', 'desc')
            .first();
        res.status(201).json({
            ...createdProject,
            name: createdProject.title // Map database 'title' to frontend 'name'
        });
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});
// Update project
router.put('/:id', auth_middleware_1.default, async (req, res) => {
    try {
        const { name, description, color } = req.body;
        // Validate color format if provided
        if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
            return res.status(400).json({ error: 'Invalid color format. Use hex format like #3182CE' });
        }
        const updateData = {
            updated_at: new Date().toISOString()
        };
        if (name !== undefined)
            updateData.title = name; // Database uses 'title' not 'name'
        if (description !== undefined)
            updateData.description = description;
        if (color !== undefined)
            updateData.color = color;
        const updated = await (0, db_1.default)('projects')
            .where({
            id: req.params.id,
            user_id: req.user.userId
        })
            .update(updateData);
        if (!updated) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const project = await (0, db_1.default)('projects')
            .where({ id: req.params.id })
            .first();
        res.json({
            ...project,
            name: project.title // Map database 'title' to frontend 'name'
        });
    }
    catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});
// Delete project
router.delete('/:id', auth_middleware_1.default, async (req, res) => {
    try {
        // First delete all tasks associated with the project
        await (0, db_1.default)('tasks')
            .where({ project_id: req.params.id })
            .delete();
        // Then delete the project
        const deleted = await (0, db_1.default)('projects')
            .where({
            id: req.params.id,
            user_id: req.user.userId
        })
            .delete();
        if (!deleted) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});
exports.default = router;
