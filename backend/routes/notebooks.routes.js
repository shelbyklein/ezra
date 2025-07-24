"use strict";
/**
 * Notebook CRUD endpoints for managing notebooks, folders, and pages
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const db_1 = __importDefault(require("../src/db"));
const router = express_1.default.Router();
// ============ NOTEBOOKS ============
// Get all notebooks for authenticated user
router.get('/', auth_middleware_1.default, async (req, res) => {
    try {
        const notebooks = await (0, db_1.default)('notebooks')
            .where({ user_id: req.user.userId })
            .orderBy('position', 'asc');
        res.json(notebooks);
    }
    catch (error) {
        console.error('Error fetching notebooks:', error);
        res.status(500).json({ error: 'Failed to fetch notebooks' });
    }
});
// Get single notebook with structure
router.get('/:id', auth_middleware_1.default, async (req, res) => {
    try {
        const notebook = await (0, db_1.default)('notebooks')
            .where({
            id: req.params.id,
            user_id: req.user.userId
        })
            .first();
        if (!notebook) {
            return res.status(404).json({ error: 'Notebook not found' });
        }
        // Get folders for this notebook
        const folders = await (0, db_1.default)('notebook_folders')
            .where({ notebook_id: notebook.id })
            .orderBy('position', 'asc');
        // Get pages for this notebook
        const pages = await (0, db_1.default)('notebook_pages')
            .where({ notebook_id: notebook.id })
            .orderBy('position', 'asc')
            .select('id', 'notebook_id', 'folder_id', 'title', 'slug', 'position', 'is_starred', 'created_at', 'updated_at');
        res.json({
            ...notebook,
            folders,
            pages
        });
    }
    catch (error) {
        console.error('Error fetching notebook:', error);
        res.status(500).json({ error: 'Failed to fetch notebook' });
    }
});
// Create new notebook
router.post('/', auth_middleware_1.default, async (req, res) => {
    try {
        const { title, description, icon } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        // Get the highest position
        const maxPosition = await (0, db_1.default)('notebooks')
            .where({ user_id: req.user.userId })
            .max('position as max')
            .first();
        const notebook = {
            user_id: req.user.userId,
            title,
            description: description || null,
            icon: icon || null,
            position: (maxPosition?.max || 0) + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await (0, db_1.default)('notebooks').insert(notebook);
        const createdNotebook = await (0, db_1.default)('notebooks')
            .where({ user_id: req.user.userId })
            .orderBy('id', 'desc')
            .first();
        res.status(201).json(createdNotebook);
    }
    catch (error) {
        console.error('Error creating notebook:', error);
        res.status(500).json({ error: 'Failed to create notebook' });
    }
});
// Update notebook
router.put('/:id', auth_middleware_1.default, async (req, res) => {
    try {
        const { title, description, icon, position } = req.body;
        const updateData = {
            updated_at: new Date().toISOString()
        };
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (icon !== undefined)
            updateData.icon = icon;
        if (position !== undefined)
            updateData.position = position;
        const updated = await (0, db_1.default)('notebooks')
            .where({
            id: req.params.id,
            user_id: req.user.userId
        })
            .update(updateData);
        if (!updated) {
            return res.status(404).json({ error: 'Notebook not found' });
        }
        const notebook = await (0, db_1.default)('notebooks')
            .where({ id: req.params.id })
            .first();
        res.json(notebook);
    }
    catch (error) {
        console.error('Error updating notebook:', error);
        res.status(500).json({ error: 'Failed to update notebook' });
    }
});
// Delete notebook
router.delete('/:id', auth_middleware_1.default, async (req, res) => {
    try {
        const deleted = await (0, db_1.default)('notebooks')
            .where({
            id: req.params.id,
            user_id: req.user.userId
        })
            .delete();
        if (!deleted) {
            return res.status(404).json({ error: 'Notebook not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting notebook:', error);
        res.status(500).json({ error: 'Failed to delete notebook' });
    }
});
// Batch update positions for drag and drop
router.put('/:notebookId/batch-update', auth_middleware_1.default, async (req, res) => {
    try {
        const { updates } = req.body;
        // Verify notebook ownership
        const notebook = await (0, db_1.default)('notebooks')
            .where({
            id: req.params.notebookId,
            user_id: req.user.userId
        })
            .first();
        if (!notebook) {
            return res.status(404).json({ error: 'Notebook not found' });
        }
        // Start transaction
        await db_1.default.transaction(async (trx) => {
            // Update each item
            for (const update of updates) {
                if (update.type === 'folder') {
                    await trx('notebook_folders')
                        .where({ id: update.id })
                        .update({
                        parent_folder_id: update.parent_folder_id,
                        position: update.position,
                        updated_at: new Date().toISOString()
                    });
                }
                else if (update.type === 'page') {
                    await trx('notebook_pages')
                        .where({ id: update.id })
                        .update({
                        folder_id: update.folder_id,
                        position: update.position,
                        updated_at: new Date().toISOString()
                    });
                }
            }
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error batch updating positions:', error);
        res.status(500).json({ error: 'Failed to update positions' });
    }
});
// ============ FOLDERS ============
// Create folder
router.post('/:notebookId/folders', auth_middleware_1.default, async (req, res) => {
    try {
        const { name, parent_folder_id, icon } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        // Verify notebook ownership
        const notebook = await (0, db_1.default)('notebooks')
            .where({
            id: req.params.notebookId,
            user_id: req.user.userId
        })
            .first();
        if (!notebook) {
            return res.status(404).json({ error: 'Notebook not found' });
        }
        // Get the highest position
        const maxPosition = await (0, db_1.default)('notebook_folders')
            .where({
            notebook_id: req.params.notebookId,
            parent_folder_id: parent_folder_id || null
        })
            .max('position as max')
            .first();
        const folder = {
            notebook_id: parseInt(req.params.notebookId),
            parent_folder_id: parent_folder_id || null,
            name,
            icon: icon || null,
            position: (maxPosition?.max || 0) + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await (0, db_1.default)('notebook_folders').insert(folder);
        const createdFolder = await (0, db_1.default)('notebook_folders')
            .where({ notebook_id: req.params.notebookId })
            .orderBy('id', 'desc')
            .first();
        res.status(201).json(createdFolder);
    }
    catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ error: 'Failed to create folder' });
    }
});
// Update folder
router.put('/folders/:id', auth_middleware_1.default, async (req, res) => {
    try {
        const { name, icon, parent_folder_id, position } = req.body;
        // Verify ownership through notebook
        const folder = await (0, db_1.default)('notebook_folders as f')
            .join('notebooks as n', 'f.notebook_id', 'n.id')
            .where({
            'f.id': req.params.id,
            'n.user_id': req.user.userId
        })
            .select('f.*')
            .first();
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }
        const updateData = {
            updated_at: new Date().toISOString()
        };
        if (name !== undefined)
            updateData.name = name;
        if (icon !== undefined)
            updateData.icon = icon;
        if (parent_folder_id !== undefined)
            updateData.parent_folder_id = parent_folder_id;
        if (position !== undefined)
            updateData.position = position;
        await (0, db_1.default)('notebook_folders')
            .where({ id: req.params.id })
            .update(updateData);
        const updatedFolder = await (0, db_1.default)('notebook_folders')
            .where({ id: req.params.id })
            .first();
        res.json(updatedFolder);
    }
    catch (error) {
        console.error('Error updating folder:', error);
        res.status(500).json({ error: 'Failed to update folder' });
    }
});
// Delete folder
router.delete('/folders/:id', auth_middleware_1.default, async (req, res) => {
    try {
        // Verify ownership through notebook
        const folder = await (0, db_1.default)('notebook_folders as f')
            .join('notebooks as n', 'f.notebook_id', 'n.id')
            .where({
            'f.id': req.params.id,
            'n.user_id': req.user.userId
        })
            .select('f.id')
            .first();
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }
        await (0, db_1.default)('notebook_folders')
            .where({ id: req.params.id })
            .delete();
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ error: 'Failed to delete folder' });
    }
});
// ============ PAGES ============
// Get page content
router.get('/pages/:id', auth_middleware_1.default, async (req, res) => {
    try {
        const page = await (0, db_1.default)('notebook_pages as p')
            .join('notebooks as n', 'p.notebook_id', 'n.id')
            .where({
            'p.id': req.params.id,
            'n.user_id': req.user.userId
        })
            .select('p.*')
            .first();
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json(page);
    }
    catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).json({ error: 'Failed to fetch page' });
    }
});
// Create page
router.post('/:notebookId/pages', auth_middleware_1.default, async (req, res) => {
    try {
        const { title, folder_id, content } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        // Verify notebook ownership
        const notebook = await (0, db_1.default)('notebooks')
            .where({
            id: req.params.notebookId,
            user_id: req.user.userId
        })
            .first();
        if (!notebook) {
            return res.status(404).json({ error: 'Notebook not found' });
        }
        // Generate slug from title
        const baseSlug = title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        // Ensure unique slug
        let slug = baseSlug;
        let counter = 1;
        while (true) {
            const existing = await (0, db_1.default)('notebook_pages')
                .where({
                notebook_id: req.params.notebookId,
                slug
            })
                .first();
            if (!existing)
                break;
            slug = `${baseSlug}-${counter++}`;
        }
        // Get the highest position
        const maxPosition = await (0, db_1.default)('notebook_pages')
            .where({
            notebook_id: req.params.notebookId,
            folder_id: folder_id || null
        })
            .max('position as max')
            .first();
        const page = {
            notebook_id: parseInt(req.params.notebookId),
            folder_id: folder_id || null,
            title,
            slug,
            content: content || JSON.stringify({ type: 'doc', content: [] }),
            position: (maxPosition?.max || 0) + 1,
            is_starred: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await (0, db_1.default)('notebook_pages').insert(page);
        const createdPage = await (0, db_1.default)('notebook_pages')
            .where({ notebook_id: req.params.notebookId })
            .orderBy('id', 'desc')
            .first();
        res.status(201).json(createdPage);
    }
    catch (error) {
        console.error('Error creating page:', error);
        res.status(500).json({ error: 'Failed to create page' });
    }
});
// Update page
router.put('/pages/:id', auth_middleware_1.default, async (req, res) => {
    try {
        const { title, content, folder_id, position, is_starred } = req.body;
        // Verify ownership through notebook
        const page = await (0, db_1.default)('notebook_pages as p')
            .join('notebooks as n', 'p.notebook_id', 'n.id')
            .where({
            'p.id': req.params.id,
            'n.user_id': req.user.userId
        })
            .select('p.*')
            .first();
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        const updateData = {
            updated_at: new Date().toISOString()
        };
        if (title !== undefined) {
            updateData.title = title;
            // Update slug if title changed
            const baseSlug = title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            let slug = baseSlug;
            let counter = 1;
            while (true) {
                const existing = await (0, db_1.default)('notebook_pages')
                    .where({
                    notebook_id: page.notebook_id,
                    slug
                })
                    .whereNot({ id: req.params.id })
                    .first();
                if (!existing)
                    break;
                slug = `${baseSlug}-${counter++}`;
            }
            updateData.slug = slug;
        }
        if (content !== undefined)
            updateData.content = content;
        if (folder_id !== undefined)
            updateData.folder_id = folder_id;
        if (position !== undefined)
            updateData.position = position;
        if (is_starred !== undefined)
            updateData.is_starred = is_starred;
        await (0, db_1.default)('notebook_pages')
            .where({ id: req.params.id })
            .update(updateData);
        const updatedPage = await (0, db_1.default)('notebook_pages')
            .where({ id: req.params.id })
            .first();
        res.json(updatedPage);
    }
    catch (error) {
        console.error('Error updating page:', error);
        res.status(500).json({ error: 'Failed to update page' });
    }
});
// Delete page
router.delete('/pages/:id', auth_middleware_1.default, async (req, res) => {
    try {
        // Verify ownership through notebook
        const page = await (0, db_1.default)('notebook_pages as p')
            .join('notebooks as n', 'p.notebook_id', 'n.id')
            .where({
            'p.id': req.params.id,
            'n.user_id': req.user.userId
        })
            .select('p.id')
            .first();
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        await (0, db_1.default)('notebook_pages')
            .where({ id: req.params.id })
            .delete();
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting page:', error);
        res.status(500).json({ error: 'Failed to delete page' });
    }
});
// Search pages across notebooks
router.get('/search', auth_middleware_1.default, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        const pages = await (0, db_1.default)('notebook_pages as p')
            .join('notebooks as n', 'p.notebook_id', 'n.id')
            .where('n.user_id', req.user.userId)
            .where(function () {
            this.where('p.title', 'like', `%${q}%`)
                .orWhere('p.content', 'like', `%${q}%`);
        })
            .select('p.id', 'p.title', 'p.slug', 'p.notebook_id', 'p.folder_id', 'n.title as notebook_title')
            .limit(20);
        res.json(pages);
    }
    catch (error) {
        console.error('Error searching pages:', error);
        res.status(500).json({ error: 'Failed to search pages' });
    }
});
exports.default = router;
//# sourceMappingURL=notebooks.routes.js.map