#!/bin/sh
set -e

echo "Starting Ezra Backend v2..."

# Create database directory if it doesn't exist
mkdir -p /app/data

# Initialize database with essential tables from SQL file
echo "Initializing database with base schema..."
sqlite3 /app/data/ezra.db < /app/backend/init-db.sql || echo "Warning: Some tables may already exist"

# Create uploads directories
mkdir -p /app/uploads/avatars
mkdir -p /app/uploads/notebooks

echo "Running database migrations..."
cd /app/backend

# Ensure we have the compiled JavaScript
if [ ! -d "dist" ]; then
  echo "Building backend..."
  npm run build
fi

# Run migrations using knex
echo "Applying database migrations..."
npx knex migrate:latest --knexfile knexfile.js || {
  echo "Warning: Some migrations may have failed. Attempting to continue..."
  
  # Fallback: Ensure critical tables exist
  echo "Ensuring critical tables exist..."
  
  # Attachments table (often missing)
  sqlite3 /app/data/ezra.db "CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    mime_type VARCHAR(100),
    size INTEGER,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );" || true
  
  # Create index for attachments
  sqlite3 /app/data/ezra.db "CREATE INDEX IF NOT EXISTS idx_attachments_task_type ON attachments(task_id, type);" || true
}

# Show migration status
echo "Current migration status:"
npx knex migrate:status --knexfile knexfile.js || true

# List all tables to verify
echo "Database tables:"
sqlite3 /app/data/ezra.db ".tables" || true

echo "Starting server with schema validation..."
node dist/src/index.js