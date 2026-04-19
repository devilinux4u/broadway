.PHONY: help install dev build run migrate-sql migrate-gorm db-create db-drop clean compose-up compose-down compose-logs

help:
	@echo "E-Commerce Backend Commands"
	@echo "=============================="
	@echo "make install      - Download and install dependencies"
	@echo "make dev          - Run server in development mode"
	@echo "make build        - Build the binary"
	@echo "make run          - Run the built binary"
	@echo "make migrate-sql  - Run manual SQL migrations"
	@echo "make db-create    - Create PostgreSQL database"
	@echo "make db-drop      - Drop PostgreSQL database (caution!)"
	@echo "make clean        - Clean build artifacts"

install:
	@echo "Installing dependencies..."
	go mod download
	go mod tidy

dev:
	@echo "Running in development mode..."
	@echo "Make sure .env is configured and PostgreSQL is running"
	go run cmd/main.go

build:
	@echo "Building binary..."
	go build -o bin/ecom-server cmd/main.go

run: build
	@echo "Running server..."
	./bin/ecom-server

migrate-sql:
	@echo "Running SQL migrations..."
	@echo "Make sure PostgreSQL is running and .env is configured"
	for file in migrations/*.sql; do \
		echo "Applying $$file"; \
		psql -U $(DB_USER) -h $(DB_HOST) -d $(DB_NAME) -f $$file; \
	done

db-create:
	@echo "Creating database 'ecom_db'..."
	createdb ecom_db

db-drop:
	@echo "WARNING: This will drop the 'ecom_db' database"
	@echo "Press Ctrl+C to cancel..."
	@sleep 3
	dropdb ecom_db

clean:
	@echo "Cleaning build artifacts..."
	rm -rf bin/

# Environment setup
setup-env:
	@echo "Creating .env file from template..."
	cp .env.example .env
	@echo ".env created. Please edit with your database credentials."

# Development tools
fmt:
	go fmt ./...

vet:
	go vet ./...

test:
	go test ./...

# Docker commands (optional)
docker-up:
	@echo "Starting PostgreSQL in Docker..."
	docker run --name postgres-ecom -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres:15

docker-down:
	@echo "Stopping PostgreSQL container..."
	docker stop postgres-ecom
	docker rm postgres-ecom

# Docker Compose commands
compose-up:
	@echo "Starting services without recreating an existing postgres container..."
	docker compose up -d --no-recreate postgres
	docker compose up -d backend

compose-down:
	@echo "Stopping Docker Compose services..."
	docker compose down

compose-logs:
	@echo "Tailing Docker Compose logs..."
	docker compose logs -f --tail=100

# Full setup
setup: install setup-env db-create migrate-sql
	@echo "Setup complete! Run 'make dev' to start the server"

.DEFAULT_GOAL := help
