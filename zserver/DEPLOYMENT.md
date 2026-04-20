# Backend Deployment Guide

## Prerequisites

- Docker and Docker Compose installed on your VPS
- Port 2004 available (or modify docker-compose.yml)

## Deployment Steps

### 1. Clone/Copy the Backend Files

Copy the `zserver` directory to your VPS.

### 2. Configure Environment Variables

Create a `.env` file in the `zserver` directory:

```bash
cp .env.example .env
```

Then edit `.env` with your production values:

```bash
nano .env
```

**Important variables to update:**
- `DB_PASSWORD` - Set a strong PostgreSQL password
- `JWT_SECRET` - Set a secure JWT secret
- `KHALTI_LIVE_KEY` - Your Khalti API key
- `WEBSITE_URL` - Your actual domain
- `RETURN_URL` - Payment callback URL

### 3. Build and Run

```bash
# Build and start services
docker compose up -d

# View logs
docker compose logs -f backend

# Check status
docker compose ps
```

### 4. Verify Deployment

```bash
curl http://localhost:2004/health
```

## Useful Commands

### View Logs
```bash
docker compose logs -f backend
docker compose logs -f postgres
```

### Stop Services
```bash
docker compose down
```

### Stop and Remove Volumes (Warning: Deletes data)
```bash
docker compose down -v
```

### Rebuild Image
```bash
docker compose build --no-cache
docker compose up -d
```

### Database Access
```bash
docker compose exec postgres psql -U postgres -d ecom_db
```

### Restart Services
```bash
docker compose restart
```

## Port Configuration

The backend runs on **port 2004**. Update your reverse proxy (nginx, Apache, etc.) to forward requests:

### Nginx Example
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:2004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Persistence

- Database data is stored in a Docker volume (`postgres_data`)
- Uploaded files are stored in `./uploads/` directory
- These survive container restarts and removals (unless using `down -v`)

## Troubleshooting

### Database Connection Issues
```bash
# Check if postgres is running
docker compose ps

# View postgres logs
docker compose logs postgres

# Verify environment variables
docker compose config
```

### Port Already in Use
If port 2004 is busy, modify `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:2004"
```

### Permission Issues
```bash
sudo chown -R $USER:$USER ./uploads/
```

## Security Notes

1. Always use strong passwords in production
2. Keep `.env` file secure and out of version control
3. Consider using a reverse proxy (nginx) for SSL/TLS
4. Regularly backup your database volumes
5. Update Docker images periodically for security patches
