#!/bin/sh
set -e

echo "Starting Ezra Backend..."

# Create necessary directories
mkdir -p /app/data /app/uploads/avatars /app/uploads/notebooks

# Wait for database to be ready (if using PostgreSQL)
if [ "$DATABASE_URL" ] && echo "$DATABASE_URL" | grep -q "postgresql"; then
  echo "Waiting for PostgreSQL to be ready..."
  until pg_isready -h "${DB_HOST:-postgres}" -U "${DB_USER:-ezra_user}"; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
  done
  echo "PostgreSQL is ready!"
fi

# Run database migrations
echo "Running database migrations..."
cd /app/backend

# Set NODE_ENV if not already set
export NODE_ENV=${NODE_ENV:-production}

# Run migrations using knex
echo "Applying migrations..."
npx knex migrate:latest --knexfile knexfile.js

# Check migration status
echo "Current migration status:"
npx knex migrate:status --knexfile knexfile.js || true

echo "Migrations completed successfully"

# Start the server
echo "Starting server..."
node dist/src/index.js