"use strict";
/**
 * File upload endpoints for handling binary file uploads
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const db_1 = __importDefault(require("../src/db"));
const router = express_1.default.Router();
// Create uploads directories if they don't exist
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
const notebooksDir = path_1.default.join(uploadsDir, 'notebooks');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs_1.default.existsSync(notebooksDir)) {
    fs_1.default.mkdirSync(notebooksDir, { recursive: true });
}
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common file types
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip',
            'application/x-zip-compressed',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`File type ${file.mimetype} not allowed`));
        }
    }
});
// Configure multer for notebook image uploads
const notebookImageStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, notebooksDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});
const uploadNotebookImage = (0, multer_1.default)({
    storage: notebookImageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit for images
    },
    fileFilter: (req, file, cb) => {
        // Only allow image types
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Only image files are allowed. Received: ${file.mimetype}`));
        }
    }
});
// Upload image for a notebook
router.post('/notebook/:notebookId/image', auth_middleware_1.default, uploadNotebookImage.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        const { notebookId } = req.params;
        // Verify the notebook belongs to the user
        const notebook = await (0, db_1.default)('notebooks')
            .where({
            id: notebookId,
            user_id: req.user.userId
        })
            .first();
        if (!notebook) {
            // Delete the uploaded file
            fs_1.default.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Notebook not found' });
        }
        // Return the image URL
        res.status(201).json({
            url: `/api/uploads/notebooks/${req.file.filename}`,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype
        });
    }
    catch (error) {
        // Clean up uploaded file on error
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        console.error('Error uploading notebook image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});
// Upload file for a task
router.post('/task/:taskId', auth_middleware_1.default, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { taskId } = req.params;
        // Verify the task belongs to the user
        const task = await (0, db_1.default)('tasks')
            .join('projects', 'tasks.project_id', 'projects.id')
            .where({
            'tasks.id': taskId,
            'projects.user_id': req.user.userId
        })
            .select('tasks.id')
            .first();
        if (!task) {
            // Delete the uploaded file
            fs_1.default.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Task not found' });
        }
        // Create attachment record
        const attachment = {
            task_id: taskId,
            type: 'file',
            name: req.file.originalname,
            content: req.file.filename, // Store the filename instead of content
            mime_type: req.file.mimetype,
            size: req.file.size,
            metadata: JSON.stringify({
                filename: req.file.filename,
                originalname: req.file.originalname,
                path: req.file.path,
            }),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        const [attachmentId] = await (0, db_1.default)('attachments').insert(attachment).returning('id');
        // Fetch the created attachment
        const createdAttachment = await (0, db_1.default)('attachments')
            .where({ id: attachmentId })
            .first();
        res.status(201).json({
            ...createdAttachment,
            url: `/api/upload/files/${req.file.filename}`
        });
    }
    catch (error) {
        // Clean up uploaded file on error
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});
// Get uploaded file
router.get('/files/:filename', auth_middleware_1.default, async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path_1.default.join(uploadsDir, filename);
        // Check if file exists
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        // Verify the user has access to this file
        const attachment = await (0, db_1.default)('attachments as a')
            .join('tasks as t', 'a.task_id', 't.id')
            .join('projects as p', 't.project_id', 'p.id')
            .where({
            'a.content': filename,
            'p.user_id': req.user.userId
        })
            .select('a.*')
            .first();
        if (!attachment) {
            return res.status(403).json({ error: 'Access denied' });
        }
        // Send the file
        res.sendFile(filePath);
    }
    catch (error) {
        console.error('Error serving file:', error);
        res.status(500).json({ error: 'Failed to serve file' });
    }
});
// Delete uploaded file
router.delete('/files/:filename', auth_middleware_1.default, async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path_1.default.join(uploadsDir, filename);
        // Verify the user has access to this file
        const attachment = await (0, db_1.default)('attachments as a')
            .join('tasks as t', 'a.task_id', 't.id')
            .join('projects as p', 't.project_id', 'p.id')
            .where({
            'a.content': filename,
            'p.user_id': req.user.userId
        })
            .select('a.id')
            .first();
        if (!attachment) {
            return res.status(403).json({ error: 'Access denied' });
        }
        // Delete the file from filesystem
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        // Delete the attachment record
        await (0, db_1.default)('attachments')
            .where({ id: attachment.id })
            .delete();
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map