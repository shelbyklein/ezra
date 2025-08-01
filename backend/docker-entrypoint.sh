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

# Create notebook_folders table first (before notebook_pages)
sqlite3 /app/data/ezra.db "CREATE TABLE IF NOT EXISTS notebook_folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notebook_id INTEGER NOT NULL,
  parent_folder_id INTEGER,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_folder_id) REFERENCES notebook_folders(id) ON DELETE CASCADE
);"

# Create notebook_pages table if it doesn't exist
sqlite3 /app/data/ezra.db "CREATE TABLE IF NOT EXISTS notebook_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT,
  notebook_id INTEGER NOT NULL,
  folder_id INTEGER,
  is_starred BOOLEAN DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES notebook_folders(id) ON DELETE SET NULL,
  UNIQUE(notebook_id, slug)
);"

# Create indexes for notebook_pages
sqlite3 /app/data/ezra.db "CREATE INDEX IF NOT EXISTS idx_notebook_pages_notebook_id ON notebook_pages(notebook_id);"
sqlite3 /app/data/ezra.db "CREATE INDEX IF NOT EXISTS idx_notebook_pages_slug ON notebook_pages(slug);"
sqlite3 /app/data/ezra.db "CREATE INDEX IF NOT EXISTS idx_notebook_pages_is_starred ON notebook_pages(is_starred);"

# Create chat history tables if they don't exist
sqlite3 /app/data/ezra.db "CREATE TABLE IF NOT EXISTS chat_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title VARCHAR(255),
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);"

sqlite3 /app/data/ezra.db "CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
);"

# Create notebook_tags table if it doesn't exist
sqlite3 /app/data/ezra.db "CREATE TABLE IF NOT EXISTS notebook_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notebook_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(notebook_id, tag_id)
);"

# Create indexes for notebook_folders
sqlite3 /app/data/ezra.db "CREATE INDEX IF NOT EXISTS idx_notebook_folders_notebook_id ON notebook_folders(notebook_id);"
sqlite3 /app/data/ezra.db "CREATE INDEX IF NOT EXISTS idx_notebook_folders_parent_folder_id ON notebook_folders(parent_folder_id);"
sqlite3 /app/data/ezra.db "CREATE INDEX IF NOT EXISTS idx_notebook_folders_position ON notebook_folders(notebook_id, position);"

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

# Add project_id column to notebooks table if it doesn't exist
sqlite3 /app/data/ezra.db "
PRAGMA table_info(notebooks);
" | grep -q "project_id" || sqlite3 /app/data/ezra.db "ALTER TABLE notebooks ADD COLUMN project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL;"

# Add anthropic_api_key column to users table if it doesn't exist
sqlite3 /app/data/ezra.db "
PRAGMA table_info(users);
" | grep -q "anthropic_api_key" || sqlite3 /app/data/ezra.db "ALTER TABLE users ADD COLUMN anthropic_api_key VARCHAR(255);"

# Add password reset columns to users table if they don't exist
sqlite3 /app/data/ezra.db "
PRAGMA table_info(users);
" | grep -q "reset_token" || sqlite3 /app/data/ezra.db "ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);"

sqlite3 /app/data/ezra.db "
PRAGMA table_info(users);
" | grep -q "reset_token_expires" || sqlite3 /app/data/ezra.db "ALTER TABLE users ADD COLUMN reset_token_expires DATETIME;"

# Add avatar_url column to users table if it doesn't exist
sqlite3 /app/data/ezra.db "
PRAGMA table_info(users);
" | grep -q "avatar_url" || sqlite3 /app/data/ezra.db "ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255);"

# Add username column to users table if it doesn't exist
sqlite3 /app/data/ezra.db "
PRAGMA table_info(users);
" | grep -q "username" || sqlite3 /app/data/ezra.db "ALTER TABLE users ADD COLUMN username VARCHAR(255);"

# Rename projects.name to projects.title if needed
if sqlite3 /app/data/ezra.db "PRAGMA table_info(projects);" | grep -q "name" && ! sqlite3 /app/data/ezra.db "PRAGMA table_info(projects);" | grep -q "title"; then
  echo "Renaming projects.name to projects.title..."
  sqlite3 /app/data/ezra.db "ALTER TABLE projects RENAME COLUMN name TO title;"
fi

# Add started_at column to chat_conversations table if it doesn't exist
sqlite3 /app/data/ezra.db "
PRAGMA table_info(chat_conversations);
" | grep -q "started_at" || sqlite3 /app/data/ezra.db "ALTER TABLE chat_conversations ADD COLUMN started_at DATETIME DEFAULT CURRENT_TIMESTAMP;"

# Add folder_id column to notebook_pages table if it doesn't exist
sqlite3 /app/data/ezra.db "
PRAGMA table_info(notebook_pages);
" | grep -q "folder_id" || sqlite3 /app/data/ezra.db "ALTER TABLE notebook_pages ADD COLUMN folder_id INTEGER REFERENCES notebook_folders(id) ON DELETE SET NULL;"

# Create index for notebook_pages folder_id after ensuring column exists
sqlite3 /app/data/ezra.db "CREATE INDEX IF NOT EXISTS idx_notebook_pages_folder_id ON notebook_pages(notebook_id, folder_id);"

echo "Missing columns added successfully"

# Run Knex migrations to ensure any new migrations are applied
echo "Running database migrations..."
cd /app/backend
if [ -f "knexfile.js" ]; then
  echo "Applying any pending migrations..."
  npx knex migrate:latest --knexfile knexfile.js || echo "Migration warning: Some migrations may have failed, but continuing..."
  echo "Migration status:"
  npx knex migrate:status --knexfile knexfile.js || true
else
  echo "No knexfile.js found, skipping migrations"
fi

echo "Starting server..."
node dist/src/index.js