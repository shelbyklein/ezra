#!/bin/sh
set -e

echo "Starting Ezra Backend..."

# Create database directory if it doesn't exist
mkdir -p /app/data

# Initialize database with essential tables
echo "Ensuring database tables exist..."
sqlite3 /app/data/ezra.db < /app/backend/init-db.sql
echo "Database tables verified/created"

# Check and create missing tables directly
echo "Checking for missing tables..."

# Create project_tags table if it doesn't exist
sqlite3 /app/data/ezra.db "CREATE TABLE IF NOT EXISTS project_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(project_id, tag_id)
);"

# Create notebook_pages table if it doesn't exist
sqlite3 /app/data/ezra.db "CREATE TABLE IF NOT EXISTS notebook_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT,
  notebook_id INTEGER NOT NULL,
  is_starred BOOLEAN DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE,
  UNIQUE(notebook_id, slug)
);"

# Create indexes for notebook_pages
sqlite3 /app/data/ezra.db "CREATE INDEX IF NOT EXISTS idx_notebook_pages_notebook_id ON notebook_pages(notebook_id);"
sqlite3 /app/data/ezra.db "CREATE INDEX IF NOT EXISTS idx_notebook_pages_slug ON notebook_pages(slug);"
sqlite3 /app/data/ezra.db "CREATE INDEX IF NOT EXISTS idx_notebook_pages_is_starred ON notebook_pages(is_starred);"

echo "All required tables verified/created"

# Add missing columns to existing tables
echo "Adding missing columns to tables..."

# Add icon, color, and position columns to notebooks table if they don't exist
sqlite3 /app/data/ezra.db "
PRAGMA table_info(notebooks);
" | grep -q "icon" || sqlite3 /app/data/ezra.db "ALTER TABLE notebooks ADD COLUMN icon VARCHAR(255) DEFAULT '📔';"

sqlite3 /app/data/ezra.db "
PRAGMA table_info(notebooks);
" | grep -q "color" || sqlite3 /app/data/ezra.db "ALTER TABLE notebooks ADD COLUMN color VARCHAR(7) DEFAULT '#3B82F6';"

sqlite3 /app/data/ezra.db "
PRAGMA table_info(notebooks);
" | grep -q "position" || sqlite3 /app/data/ezra.db "ALTER TABLE notebooks ADD COLUMN position INTEGER DEFAULT 0;"

# Add color column to projects table if it doesn't exist
sqlite3 /app/data/ezra.db "
PRAGMA table_info(projects);
" | grep -q "color" || sqlite3 /app/data/ezra.db "ALTER TABLE projects ADD COLUMN color VARCHAR(7) DEFAULT '#10B981';"

# Add position column to tasks table if it doesn't exist
sqlite3 /app/data/ezra.db "
PRAGMA table_info(tasks);
" | grep -q "position" || sqlite3 /app/data/ezra.db "ALTER TABLE tasks ADD COLUMN position INTEGER DEFAULT 0;"

echo "Missing columns added successfully"

echo "Starting server..."
cd /app/backend
node dist/src/index.js