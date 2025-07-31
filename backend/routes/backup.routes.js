"use strict";
/**
 * Backup and restore routes for data export/import
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const db_1 = __importDefault(require("../src/db"));
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Schema for exported data
const ExportDataSchema = zod_1.z.object({
    version: zod_1.z.string(),
    exportDate: zod_1.z.string(),
    user: zod_1.z.object({
        id: zod_1.z.number(),
        username: zod_1.z.string(),
        email: zod_1.z.string(),
    }),
    data: zod_1.z.object({
        projects: zod_1.z.array(zod_1.z.any()),
        tasks: zod_1.z.array(zod_1.z.any()),
        notebooks: zod_1.z.array(zod_1.z.any()),
        folders: zod_1.z.array(zod_1.z.any()),
        pages: zod_1.z.array(zod_1.z.any()),
        blocks: zod_1.z.array(zod_1.z.any()),
        tags: zod_1.z.array(zod_1.z.any()),
        projectTags: zod_1.z.array(zod_1.z.any()),
        taskTags: zod_1.z.array(zod_1.z.any()),
        notebookTags: zod_1.z.array(zod_1.z.any()),
        taskAttachments: zod_1.z.array(zod_1.z.any()),
    }),
});
// Export all user data
router.get('/export', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        // Fetch all user data
        const [user, projects, tasks, notebooks, folders, pages, blocks, tags, taskAttachments,] = await Promise.all([
            (0, db_1.default)('users').where({ id: userId }).first(),
            (0, db_1.default)('projects').where({ user_id: userId }).orderBy('position'),
            (0, db_1.default)('tasks')
                .join('projects', 'tasks.project_id', 'projects.id')
                .where('projects.user_id', userId)
                .select('tasks.*'),
            (0, db_1.default)('notebooks').where({ user_id: userId }).orderBy('position'),
            (0, db_1.default)('folders')
                .join('notebooks', 'folders.notebook_id', 'notebooks.id')
                .where('notebooks.user_id', userId)
                .select('folders.*'),
            (0, db_1.default)('pages')
                .join('notebooks', 'pages.notebook_id', 'notebooks.id')
                .where('notebooks.user_id', userId)
                .select('pages.*'),
            (0, db_1.default)('blocks')
                .join('pages', 'blocks.page_id', 'pages.id')
                .join('notebooks', 'pages.notebook_id', 'notebooks.id')
                .where('notebooks.user_id', userId)
                .select('blocks.*'),
            (0, db_1.default)('tags').where({ user_id: userId }),
            (0, db_1.default)('task_attachments')
                .join('tasks', 'task_attachments.task_id', 'tasks.id')
                .join('projects', 'tasks.project_id', 'projects.id')
                .where('projects.user_id', userId)
                .select('task_attachments.*'),
        ]);
        // Get tag associations
        const projectIds = projects.map((p) => p.id);
        const taskIds = tasks.map((t) => t.id);
        const notebookIds = notebooks.map((n) => n.id);
        const [projectTags, taskTags, notebookTags] = await Promise.all([
            projectIds.length > 0
                ? (0, db_1.default)('project_tags').whereIn('project_id', projectIds)
                : [],
            taskIds.length > 0
                ? (0, db_1.default)('task_tags').whereIn('task_id', taskIds)
                : [],
            notebookIds.length > 0
                ? (0, db_1.default)('notebook_tags').whereIn('notebook_id', notebookIds)
                : [],
        ]);
        // Create export data
        const exportData = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            data: {
                projects,
                tasks,
                notebooks,
                folders,
                pages,
                blocks,
                tags,
                projectTags,
                taskTags,
                notebookTags,
                taskAttachments,
            },
        };
        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="ezra-backup-${new Date().toISOString().split('T')[0]}.json"`);
        res.json(exportData);
    }
    catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});
// Import user data
router.post('/import', auth_middleware_1.authenticate, async (req, res) => {
    const trx = await db_1.default.transaction();
    try {
        const userId = req.user.userId;
        const importData = req.body;
        // Validate import data structure
        const validated = ExportDataSchema.parse(importData);
        // Create ID mappings for foreign key updates
        const projectIdMap = new Map();
        const taskIdMap = new Map();
        const notebookIdMap = new Map();
        const folderIdMap = new Map();
        const pageIdMap = new Map();
        const tagIdMap = new Map();
        // Import projects
        for (const project of validated.data.projects) {
            const { id: oldId, user_id, ...projectData } = project;
            const [newProject] = await trx('projects')
                .insert({ ...projectData, user_id: userId })
                .returning('*');
            projectIdMap.set(oldId, newProject.id);
        }
        // Import tasks
        for (const task of validated.data.tasks) {
            const { id: oldId, project_id, ...taskData } = task;
            const newProjectId = projectIdMap.get(project_id);
            if (newProjectId) {
                const [newTask] = await trx('tasks')
                    .insert({ ...taskData, project_id: newProjectId })
                    .returning('*');
                taskIdMap.set(oldId, newTask.id);
            }
        }
        // Import notebooks
        for (const notebook of validated.data.notebooks) {
            const { id: oldId, user_id, project_id, ...notebookData } = notebook;
            const newProjectId = project_id ? projectIdMap.get(project_id) : null;
            const [newNotebook] = await trx('notebooks')
                .insert({
                ...notebookData,
                user_id: userId,
                project_id: newProjectId
            })
                .returning('*');
            notebookIdMap.set(oldId, newNotebook.id);
        }
        // Import folders
        for (const folder of validated.data.folders) {
            const { id: oldId, notebook_id, parent_folder_id, ...folderData } = folder;
            const newNotebookId = notebookIdMap.get(notebook_id);
            if (newNotebookId) {
                // We'll need to handle parent_folder_id in a second pass
                const [newFolder] = await trx('folders')
                    .insert({
                    ...folderData,
                    notebook_id: newNotebookId,
                    parent_folder_id: null // Set later
                })
                    .returning('*');
                folderIdMap.set(oldId, newFolder.id);
            }
        }
        // Update folder parent relationships
        for (const folder of validated.data.folders) {
            if (folder.parent_folder_id) {
                const newFolderId = folderIdMap.get(folder.id);
                const newParentId = folderIdMap.get(folder.parent_folder_id);
                if (newFolderId && newParentId) {
                    await trx('folders')
                        .where({ id: newFolderId })
                        .update({ parent_folder_id: newParentId });
                }
            }
        }
        // Import pages
        for (const page of validated.data.pages) {
            const { id: oldId, notebook_id, folder_id, ...pageData } = page;
            const newNotebookId = notebookIdMap.get(notebook_id);
            if (newNotebookId) {
                const newFolderId = folder_id ? folderIdMap.get(folder_id) : null;
                const [newPage] = await trx('pages')
                    .insert({
                    ...pageData,
                    notebook_id: newNotebookId,
                    folder_id: newFolderId
                })
                    .returning('*');
                pageIdMap.set(oldId, newPage.id);
            }
        }
        // Import blocks
        for (const block of validated.data.blocks) {
            const { id: oldId, page_id, ...blockData } = block;
            const newPageId = pageIdMap.get(page_id);
            if (newPageId) {
                await trx('blocks')
                    .insert({ ...blockData, page_id: newPageId });
            }
        }
        // Import tags
        for (const tag of validated.data.tags) {
            const { id: oldId, user_id, ...tagData } = tag;
            const [newTag] = await trx('tags')
                .insert({ ...tagData, user_id: userId })
                .returning('*');
            tagIdMap.set(oldId, newTag.id);
        }
        // Import tag associations
        for (const pt of validated.data.projectTags) {
            const newProjectId = projectIdMap.get(pt.project_id);
            const newTagId = tagIdMap.get(pt.tag_id);
            if (newProjectId && newTagId) {
                await trx('project_tags')
                    .insert({ project_id: newProjectId, tag_id: newTagId })
                    .onConflict(['project_id', 'tag_id'])
                    .ignore();
            }
        }
        for (const tt of validated.data.taskTags) {
            const newTaskId = taskIdMap.get(tt.task_id);
            const newTagId = tagIdMap.get(tt.tag_id);
            if (newTaskId && newTagId) {
                await trx('task_tags')
                    .insert({ task_id: newTaskId, tag_id: newTagId })
                    .onConflict(['task_id', 'tag_id'])
                    .ignore();
            }
        }
        for (const nt of validated.data.notebookTags) {
            const newNotebookId = notebookIdMap.get(nt.notebook_id);
            const newTagId = tagIdMap.get(nt.tag_id);
            if (newNotebookId && newTagId) {
                await trx('notebook_tags')
                    .insert({ notebook_id: newNotebookId, tag_id: newTagId })
                    .onConflict(['notebook_id', 'tag_id'])
                    .ignore();
            }
        }
        // Import task attachments
        for (const attachment of validated.data.taskAttachments) {
            const { id: oldId, task_id, ...attachmentData } = attachment;
            const newTaskId = taskIdMap.get(task_id);
            if (newTaskId) {
                await trx('task_attachments')
                    .insert({ ...attachmentData, task_id: newTaskId });
            }
        }
        await trx.commit();
        res.json({
            message: 'Data imported successfully',
            imported: {
                projects: projectIdMap.size,
                tasks: taskIdMap.size,
                notebooks: notebookIdMap.size,
                folders: folderIdMap.size,
                pages: pageIdMap.size,
                blocks: validated.data.blocks.length,
                tags: tagIdMap.size,
                attachments: validated.data.taskAttachments.length,
            },
        });
    }
    catch (error) {
        await trx.rollback();
        console.error('Import error:', error);
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                error: 'Invalid import file format',
                details: error.issues
            });
        }
        else {
            res.status(500).json({ error: 'Failed to import data' });
        }
    }
});
// Preview import data without actually importing
router.post('/import/preview', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const importData = req.body;
        // Validate import data structure
        const validated = ExportDataSchema.parse(importData);
        // Return summary of what would be imported
        res.json({
            valid: true,
            version: validated.version,
            exportDate: validated.exportDate,
            summary: {
                projects: validated.data.projects.length,
                tasks: validated.data.tasks.length,
                notebooks: validated.data.notebooks.length,
                folders: validated.data.folders.length,
                pages: validated.data.pages.length,
                blocks: validated.data.blocks.length,
                tags: validated.data.tags.length,
                attachments: validated.data.taskAttachments.length,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                valid: false,
                error: 'Invalid import file format',
                details: error.issues
            });
        }
        else {
            res.status(500).json({
                valid: false,
                error: 'Failed to validate import data'
            });
        }
    }
});
exports.default = router;
//# sourceMappingURL=backup.routes.js.map