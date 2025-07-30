#!/bin/bash
# Ezra Deployment Script
# This script handles initial deployment, updates, backups, and maintenance

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
DATA_DIR="./data"
BACKUP_DIR="./backups"
UPLOAD_DIR="./uploads"

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker is installed"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_success "Docker Compose is installed"
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        echo "Please start Docker and try again"
        exit 1
    fi
    print_success "Docker daemon is running"
}

# Setup environment
setup_environment() {
    print_header "Setting Up Environment"
    
    # Create necessary directories
    mkdir -p "$DATA_DIR" "$BACKUP_DIR" "$UPLOAD_DIR/avatars" "$UPLOAD_DIR/notebooks"
    print_success "Created necessary directories"
    
    # Check for .env file
    if [ ! -f .env ]; then
        if [ -f .env.docker ]; then
            cp .env.docker .env
            print_warning "Created .env from .env.docker - Please update with your values!"
        else
            print_error "No .env file found"
            echo "Please create a .env file with your configuration"
            echo "You can copy .env.example or .env.docker as a starting point"
            exit 1
        fi
    else
        print_success ".env file exists"
    fi
    
    # Validate required environment variables
    if [ -f .env ]; then
        if ! grep -q "ANTHROPIC_API_KEY" .env || grep -q "your-anthropic-api-key-here" .env; then
            print_error "ANTHROPIC_API_KEY not configured in .env"
            echo "Please add your Anthropic API key to the .env file"
            exit 1
        fi
        
        if ! grep -q "JWT_SECRET" .env || grep -q "your-secret-key-here" .env; then
            print_warning "JWT_SECRET is using default value"
            echo "Generating secure JWT secret..."
            JWT_SECRET=$(openssl rand -base64 32)
            sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
            print_success "Generated and saved secure JWT secret"
        fi
    fi
}

# Build and deploy
deploy() {
    print_header "Deploying Ezra"
    
    # Choose deployment type
    echo "Select deployment configuration:"
    echo "1) Simple (SQLite) - Good for getting started"
    echo "2) Production (PostgreSQL) - Recommended for production"
    echo "3) Custom - Use existing docker-compose.yml"
    read -p "Enter choice [1-3]: " choice
    
    case $choice in
        1)
            COMPOSE_FILE="docker-compose.simple.yml"
            print_success "Using simple configuration"
            ;;
        2)
            COMPOSE_FILE="docker-compose.production.yml"
            print_success "Using production configuration"
            ;;
        3)
            COMPOSE_FILE="docker-compose.yml"
            print_success "Using custom configuration"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    # Build and start containers
    print_header "Building and Starting Containers"
    docker-compose -f "$COMPOSE_FILE" build
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    print_header "Waiting for Services"
    echo "Waiting for backend to be healthy..."
    
    # Wait up to 60 seconds for backend
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose -f "$COMPOSE_FILE" ps | grep -q "backend.*healthy"; then
            print_success "Backend is healthy"
            break
        fi
        echo -n "."
        sleep 1
        ((timeout--))
    done
    
    if [ $timeout -eq 0 ]; then
        print_error "Backend failed to become healthy"
        echo "Check logs with: docker-compose -f $COMPOSE_FILE logs backend"
        exit 1
    fi
    
    print_success "All services are running!"
}

# Update deployment
update() {
    print_header "Updating Ezra"
    
    # Pull latest code
    if [ -d .git ]; then
        echo "Pulling latest changes..."
        git pull origin main
    fi
    
    # Rebuild and restart
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    docker-compose -f "$COMPOSE_FILE" up -d
    
    print_success "Update complete!"
}

# Backup data
backup() {
    print_header "Backing Up Data"
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/ezra_backup_$TIMESTAMP.tar.gz"
    
    # Create backup
    echo "Creating backup..."
    tar -czf "$BACKUP_FILE" "$DATA_DIR" "$UPLOAD_DIR" .env
    
    print_success "Backup created: $BACKUP_FILE"
    
    # Clean old backups (keep last 7)
    echo "Cleaning old backups..."
    ls -t "$BACKUP_DIR"/ezra_backup_*.tar.gz | tail -n +8 | xargs -r rm
    print_success "Old backups cleaned"
}

# Restore from backup
restore() {
    print_header "Restore from Backup"
    
    # List available backups
    echo "Available backups:"
    ls -1 "$BACKUP_DIR"/ezra_backup_*.tar.gz 2>/dev/null | nl -v 1
    
    if [ $? -ne 0 ]; then
        print_error "No backups found"
        exit 1
    fi
    
    # Select backup
    read -p "Enter backup number to restore: " backup_num
    BACKUP_FILE=$(ls -1 "$BACKUP_DIR"/ezra_backup_*.tar.gz | sed -n "${backup_num}p")
    
    if [ -z "$BACKUP_FILE" ]; then
        print_error "Invalid selection"
        exit 1
    fi
    
    # Confirm restore
    print_warning "This will overwrite current data!"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "Restore cancelled"
        exit 0
    fi
    
    # Stop services
    docker-compose -f "$COMPOSE_FILE" down
    
    # Restore backup
    echo "Restoring from $BACKUP_FILE..."
    tar -xzf "$BACKUP_FILE"
    
    # Restart services
    docker-compose -f "$COMPOSE_FILE" up -d
    
    print_success "Restore complete!"
}

# Show logs
show_logs() {
    print_header "Showing Logs"
    
    echo "Select service:"
    echo "1) All services"
    echo "2) Backend"
    echo "3) Frontend"
    echo "4) Database (if using PostgreSQL)"
    read -p "Enter choice [1-4]: " choice
    
    case $choice in
        1) docker-compose -f "$COMPOSE_FILE" logs -f ;;
        2) docker-compose -f "$COMPOSE_FILE" logs -f backend ;;
        3) docker-compose -f "$COMPOSE_FILE" logs -f frontend ;;
        4) docker-compose -f "$COMPOSE_FILE" logs -f postgres ;;
        *) print_error "Invalid choice" ;;
    esac
}

# Stop services
stop_services() {
    print_header "Stopping Services"
    docker-compose -f "$COMPOSE_FILE" down
    print_success "Services stopped"
}

# Main menu
show_menu() {
    echo
    print_header "Ezra Deployment Manager"
    echo "1) Initial deployment"
    echo "2) Update deployment"
    echo "3) Backup data"
    echo "4) Restore from backup"
    echo "5) Show logs"
    echo "6) Stop services"
    echo "7) Exit"
    echo
    read -p "Enter your choice [1-7]: " choice
    
    case $choice in
        1)
            check_prerequisites
            setup_environment
            deploy
            echo
            echo "🎉 Deployment complete!"
            echo "📱 Access Ezra at: http://localhost:3005"
            echo "🔑 Default login: Create a new account to get started"
            ;;
        2)
            update
            ;;
        3)
            backup
            ;;
        4)
            restore
            ;;
        5)
            show_logs
            ;;
        6)
            stop_services
            ;;
        7)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
}

# Main execution
if [ $# -eq 0 ]; then
    # Interactive mode
    while true; do
        show_menu
        echo
        read -p "Press Enter to continue..."
    done
else
    # Command line mode
    case $1 in
        deploy)
            check_prerequisites
            setup_environment
            deploy
            ;;
        update)
            update
            ;;
        backup)
            backup
            ;;
        restore)
            restore
            ;;
        logs)
            show_logs
            ;;
        stop)
            stop_services
            ;;
        *)
            echo "Usage: $0 [deploy|update|backup|restore|logs|stop]"
            echo "Run without arguments for interactive mode"
            exit 1
            ;;
    esac
fi