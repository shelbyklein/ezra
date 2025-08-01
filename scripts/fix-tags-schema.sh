#!/bin/bash
# Script to fix the tags table schema

DB_PATH="${1:-./data/ezra.db}"

echo "Fixing tags table schema in $DB_PATH..."

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "Database not found at $DB_PATH"
    exit 1
fi

# Backup the database first
cp "$DB_PATH" "$DB_PATH.backup-$(date +%Y%m%d-%H%M%S)"
echo "Database backed up"

# Drop the old unique constraint and recreate the table with correct schema
sqlite3 "$DB_PATH" << 'EOF'
-- Start a transaction
BEGIN TRANSACTION;

-- Create a temporary table with the correct schema
CREATE TABLE tags_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

-- Copy data from old table to new table
INSERT INTO tags_new (id, name, color, user_id, created_at, updated_at)
SELECT id, name, color, user_id, created_at, 
       COALESCE(updated_at, created_at, CURRENT_TIMESTAMP) as updated_at
FROM tags;

-- Drop the old table
DROP TABLE tags;

-- Rename the new table
ALTER TABLE tags_new RENAME TO tags;

-- Recreate the index
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- Ensure junction tables exist with correct schema
CREATE TABLE IF NOT EXISTS task_tags (
  task_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (task_id, tag_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_tags (
  project_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (project_id, tag_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notebook_tags (
  notebook_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (notebook_id, tag_id),
  FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Create indexes for junction tables
CREATE INDEX IF NOT EXISTS idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON task_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag_id ON project_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_notebook_tags_notebook_id ON notebook_tags(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebook_tags_tag_id ON notebook_tags(tag_id);

COMMIT;
EOF

echo "Tags schema fixed successfully!"
echo ""
echo "Verifying the new schema..."
sqlite3 "$DB_PATH" "PRAGMA table_info(tags);"