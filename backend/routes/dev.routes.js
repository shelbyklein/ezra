"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Development-only routes for testing and data management
const express_1 = require("express");
const db_1 = __importDefault(require("../src/db"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.Router)();
// Middleware to ensure these routes only work in development
const devOnly = (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
            error: 'This endpoint is only available in development environment'
        });
    }
    next();
};
// Apply devOnly middleware to all routes
router.use(devOnly);
// Reset all data (delete everything)
router.delete('/reset-all', async (req, res) => {
    try {
        // Delete in order to respect foreign key constraints
        await (0, db_1.default)('notes').del();
        await (0, db_1.default)('tasks').del();
        await (0, db_1.default)('projects').del();
        await (0, db_1.default)('users').del();
        res.json({
            message: 'All data has been deleted successfully',
            tables: ['notes', 'tasks', 'projects', 'users']
        });
    }
    catch (error) {
        console.error('Error resetting data:', error);
        res.status(500).json({ error: 'Failed to reset data' });
    }
});
// Reset current user's data only
router.delete('/reset-user', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        // Get all user's projects
        const projects = await (0, db_1.default)('projects').where({ user_id: userId }).select('id');
        const projectIds = projects.map(p => p.id);
        if (projectIds.length > 0) {
            // Delete all notes for user's tasks
            await (0, db_1.default)('notes')
                .whereIn('task_id', (0, db_1.default)('tasks').select('id').whereIn('project_id', projectIds))
                .del();
            // Delete all tasks for user's projects
            await (0, db_1.default)('tasks').whereIn('project_id', projectIds).del();
        }
        // Delete all user's projects
        await (0, db_1.default)('projects').where({ user_id: userId }).del();
        res.json({
            message: 'Your data has been deleted successfully',
            deletedProjects: projectIds.length
        });
    }
    catch (error) {
        console.error('Error resetting user data:', error);
        res.status(500).json({ error: 'Failed to reset user data' });
    }
});
// Seed database with sample data
router.post('/seed', async (req, res) => {
    try {
        // Create a test user if none exists
        const existingUser = await (0, db_1.default)('users').where({ email: 'test@example.com' }).first();
        let userId;
        if (!existingUser) {
            const hashedPassword = await bcrypt_1.default.hash('testpass123', 10);
            const [user] = await (0, db_1.default)('users').insert({
                email: 'test@example.com',
                username: 'testuser',
                password_hash: hashedPassword,
                full_name: 'Test User',
                is_active: true
            });
            userId = user;
        }
        else {
            userId = existingUser.id;
        }
        // Create sample projects
        const projects = [
            { name: 'Website Redesign', description: 'Redesign company website with modern UI', user_id: userId },
            { name: 'Mobile App', description: 'Build mobile app for iOS and Android', user_id: userId },
            { name: 'API Development', description: 'Create RESTful API for new features', user_id: userId }
        ];
        for (const project of projects) {
            const existingProject = await (0, db_1.default)('projects')
                .where({ name: project.name, user_id: userId })
                .first();
            if (!existingProject) {
                const [projectId] = await (0, db_1.default)('projects').insert(project);
                // Create sample tasks for each project
                const tasks = [
                    {
                        title: 'Research and planning',
                        description: 'Gather requirements and create project plan',
                        status: 'done',
                        priority: 'high',
                        project_id: projectId,
                        position: 0
                    },
                    {
                        title: 'Design mockups',
                        description: 'Create UI/UX mockups for review',
                        status: 'in_progress',
                        priority: 'high',
                        project_id: projectId,
                        position: 0,
                        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
                    },
                    {
                        title: 'Development phase 1',
                        description: 'Implement core features',
                        status: 'in_progress',
                        priority: 'medium',
                        project_id: projectId,
                        position: 1,
                        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
                    },
                    {
                        title: 'Testing',
                        description: 'Unit tests and integration tests',
                        status: 'todo',
                        priority: 'medium',
                        project_id: projectId,
                        position: 0
                    },
                    {
                        title: 'Documentation',
                        description: 'Write user and developer documentation',
                        status: 'todo',
                        priority: 'low',
                        project_id: projectId,
                        position: 1
                    },
                    {
                        title: 'Deployment',
                        description: 'Deploy to production environment',
                        status: 'todo',
                        priority: 'high',
                        project_id: projectId,
                        position: 2,
                        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
                    }
                ];
                await (0, db_1.default)('tasks').insert(tasks);
            }
        }
        res.json({
            message: 'Sample data has been created successfully',
            testUser: {
                email: 'test@example.com',
                password: 'testpass123'
            }
        });
    }
    catch (error) {
        console.error('Error seeding data:', error);
        res.status(500).json({ error: 'Failed to seed data' });
    }
});
// Get database statistics
router.get('/stats', async (req, res) => {
    try {
        const userCount = await (0, db_1.default)('users').count('* as count').first();
        const projectCount = await (0, db_1.default)('projects').count('* as count').first();
        const taskCount = await (0, db_1.default)('tasks').count('* as count').first();
        const noteCount = await (0, db_1.default)('notes').count('* as count').first();
        res.json({
            users: userCount?.count || 0,
            projects: projectCount?.count || 0,
            tasks: taskCount?.count || 0,
            notes: noteCount?.count || 0,
            environment: process.env.NODE_ENV || 'development'
        });
    }
    catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});
exports.default = router;
//# sourceMappingURL=dev.routes.js.map