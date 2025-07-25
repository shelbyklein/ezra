/**
 * File upload endpoints for handling binary file uploads
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authenticate from '../middleware/auth.middleware';
import db from '../src/db';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
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
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// Upload file for a task
router.post('/task/:taskId', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { taskId } = req.params;

    // Verify the task belongs to the user
    const task = await db('tasks')
      .join('projects', 'tasks.project_id', 'projects.id')
      .where({ 
        'tasks.id': taskId,
        'projects.user_id': req.user!.userId 
      })
      .select('tasks.id')
      .first();
    
    if (!task) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
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

    const [attachmentId] = await db('attachments').insert(attachment).returning('id');
    
    // Fetch the created attachment
    const createdAttachment = await db('attachments')
      .where({ id: attachmentId })
      .first();

    res.status(201).json({
      ...createdAttachment,
      url: `/api/upload/files/${req.file.filename}`
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get uploaded file
router.get('/files/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Verify the user has access to this file
    const attachment = await db('attachments as a')
      .join('tasks as t', 'a.task_id', 't.id')
      .join('projects as p', 't.project_id', 'p.id')
      .where({ 
        'a.content': filename,
        'p.user_id': req.user!.userId 
      })
      .select('a.*')
      .first();

    if (!attachment) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

// Delete uploaded file
router.delete('/files/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    // Verify the user has access to this file
    const attachment = await db('attachments as a')
      .join('tasks as t', 'a.task_id', 't.id')
      .join('projects as p', 't.project_id', 'p.id')
      .where({ 
        'a.content': filename,
        'p.user_id': req.user!.userId 
      })
      .select('a.id')
      .first();

    if (!attachment) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete the file from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete the attachment record
    await db('attachments')
      .where({ id: attachment.id })
      .delete();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;