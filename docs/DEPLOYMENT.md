# Deployment Guide

This document explains how to set up and configure continuous deployment for the Forum API project.

## Overview

The project uses GitHub Actions for:

- **CI (Continuous Integration)**: Automated testing on pull requests (`.github/workflows/ci.yaml`)
- **CD (Continuous Deployment)**: Automated deployment to production on master branch push (`.github/workflows/cd.yaml`)

## Prerequisites

### Production Server Requirements

1. **Ubuntu/Debian Linux server** with SSH access
2. **Node.js 22+** installed
3. **PostgreSQL 17** installed and configured
4. **PM2** process manager installed globally: `npm install -g pm2`
5. **Nginx** configured as reverse proxy with SSL/TLS
6. **Git** installed

### GitHub Repository Secrets

The CD workflow requires the following secrets to be configured in your GitHub repository.

Navigate to: **Repository Settings → Secrets and variables → Actions → New repository secret**

| Secret Name    | Description                                   | Example Value                                               |
| -------------- | --------------------------------------------- | ----------------------------------------------------------- |
| `SSH_HOST`     | Production server IP address or domain        | `giant-frogs-brush-bravely.a276.dcdg.xyz` or `123.45.67.89` |
| `SSH_USERNAME` | SSH user with access to deployment directory  | `ubuntu` or `deploy`                                        |
| `SSH_KEY`      | SSH private key for authentication (full key) | `-----BEGIN OPENSSH PRIVATE KEY-----...`                    |
| `SSH_PORT`     | SSH port (default is 22)                      | `22`                                                        |

#### How to Get SSH Private Key

On your **local machine** (not the server):

```bash
# Generate a new SSH key pair (if you don't have one)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key

# Display the private key (copy this to SSH_KEY secret)
cat ~/.ssh/github_deploy_key

# Display the public key (add this to server's authorized_keys)
cat ~/.ssh/github_deploy_key.pub
```

On your **production server**:

```bash
# Add the public key to authorized_keys
echo "your-public-key-content-here" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

## Production Server Setup

### 1. Initial Server Configuration

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 17
sudo apt install -y postgresql-17 postgresql-contrib

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### 2. Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone the repository
git clone https://github.com/gilangheavy/open-discuss.git

# Navigate to project directory
cd open-discuss
```

### 3. Configure Environment Variables

Create `.env` file in the project directory:

```bash
nano ~/open-discuss/.env
```

Add the following configuration:

```env
# Server Configuration
HOST=localhost
PORT=5000

# JWT Configuration
ACCESS_TOKEN_KEY=your_production_access_token_secret_min_32_chars
ACCESS_TOKEN_AGE=3600
REFRESH_TOKEN_KEY=your_production_refresh_token_secret_min_32_chars

# PostgreSQL Production
PGHOST=localhost
PGPORT=5432
PGUSER=forumapi_user
PGPASSWORD=strong_database_password_here
PGDATABASE=forumapi

# Application Environment
NODE_ENV=production
```

**Security Note**: Generate strong random secrets for JWT keys:

```bash
# Generate random 32-character secrets
openssl rand -base64 32
```

### 4. Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE forumapi;
CREATE USER forumapi_user WITH ENCRYPTED PASSWORD 'strong_database_password_here';
GRANT ALL PRIVILEGES ON DATABASE forumapi TO forumapi_user;
\q
```

### 5. Install Dependencies and Run Migrations

```bash
cd ~/open-discuss

# Install dependencies
npm install

# Run database migrations
npm run migrate up
```

### 6. Configure PM2

```bash
# Start the application
pm2 start src/app.js --name open-discuss

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Follow the command it outputs (will look like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your-username --hp /home/your-username
```

### 7. Configure Nginx

Use the configuration file at `config/nginx/nginx-server.conf`:

```bash
# Copy nginx config to sites-available
sudo cp ~/open-discuss/config/nginx/nginx-server.conf /etc/nginx/sites-available/open-discuss

# Create symbolic link to sites-enabled
sudo ln -s /etc/nginx/sites-available/open-discuss /etc/nginx/sites-enabled/

# Remove default config if exists
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 8. Setup SSL/TLS with Let's Encrypt

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate (replace with your domain)
sudo certbot --nginx -d giant-frogs-brush-bravely.a276.dcdg.xyz -d www.giant-frogs-brush-bravely.a276.dcdg.xyz

# Certbot will automatically configure nginx for HTTPS
# Certificate auto-renewal is handled by certbot timer

# Verify auto-renewal works
sudo certbot renew --dry-run
```

## Deployment Workflow

### Automatic Deployment Process

1. **Developer creates a Pull Request** → CI workflow runs (lint, test, audit)
2. **CI passes** → PR is reviewed and approved
3. **PR merged to master** → CD workflow triggers automatically
4. **CD workflow**:
   - Connects to production server via SSH
   - Navigates to `~/open-discuss`
   - Pulls latest code from master
   - Installs/updates dependencies (`npm install`)
   - Runs database migrations (`npm run migrate up`)
   - Restarts application (`pm2 restart open-discuss`)

### Manual Deployment (if needed)

If you need to deploy manually:

```bash
# SSH into production server
ssh user@your-server-ip

# Navigate to project directory
cd ~/open-discuss

# Pull latest changes
git pull origin master

# Install dependencies
npm install

# Run migrations
npm run migrate up

# Restart application
pm2 restart open-discuss

# Check application status
pm2 status
pm2 logs open-discuss
```

## Monitoring & Maintenance

### Check Application Status

```bash
# PM2 status
pm2 status

# View logs
pm2 logs open-discuss

# View logs in real-time
pm2 logs open-discuss --lines 100

# Monitor CPU and memory
pm2 monit
```

### Check Nginx Status

```bash
# Check nginx status
sudo systemctl status nginx

# View nginx access logs
sudo tail -f /var/log/nginx/access.log

# View nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Management

```bash
# Connect to database
psql -U forumapi_user -d forumapi

# Check database size
psql -U forumapi_user -d forumapi -c "SELECT pg_size_pretty(pg_database_size('forumapi'));"

# Backup database
pg_dump -U forumapi_user forumapi > backup_$(date +%Y%m%d).sql

# Restore database
psql -U forumapi_user forumapi < backup_20241021.sql
```

### Update Database Migrations

If new migrations are added:

```bash
# Run new migrations
npm run migrate up

# Check migration status
npm run migrate -- status

# Rollback last migration (if needed)
npm run migrate down
```

## Troubleshooting

### Deployment Failed

1. **Check GitHub Actions logs**: Go to repository → Actions tab → View failed workflow
2. **SSH connection issues**: Verify SSH_HOST, SSH_USERNAME, SSH_PORT, and SSH_KEY secrets
3. **Permission issues**: Ensure deploy user has write access to `~/open-discuss`

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs open-discuss --err

# Check if port 5000 is in use
sudo lsof -i :5000

# Restart PM2
pm2 restart open-discuss

# If needed, delete and recreate PM2 process
pm2 delete open-discuss
pm2 start src/app.js --name open-discuss
pm2 save
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
sudo -u postgres psql -l | grep forumapi

# Check user permissions
sudo -u postgres psql -c "\du"

# Test connection
psql -U forumapi_user -d forumapi -h localhost
```

### Nginx Issues

```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Manually renew certificate
sudo certbot renew

# Test renewal process
sudo certbot renew --dry-run
```

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use strong passwords** for database and JWT secrets (minimum 32 characters)
3. **Rotate JWT secrets** periodically in production
4. **Keep server updated**: `sudo apt update && sudo apt upgrade`
5. **Configure firewall**:
   ```bash
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw enable
   ```
6. **Monitor logs** regularly for suspicious activity
7. **Setup fail2ban** to prevent brute force attacks:
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

## Health Check

The API includes a health check endpoint at `/health`:

```bash
# Check application health
curl https://giant-frogs-brush-bravely.a276.dcdg.xyz/health

# Expected response:
# {
#   "status": "success",
#   "data": {
#     "message": "API is healthy",
#     "timestamp": "2025-10-21T...",
#     "database": "connected"
#   }
# }
```

## Rollback Procedure

If a deployment causes issues:

```bash
# SSH into server
ssh user@your-server-ip
cd ~/open-discuss

# Find the last working commit
git log --oneline -n 10

# Rollback to previous commit
git reset --hard <commit-hash>

# Reinstall dependencies (in case package.json changed)
npm install

# Rollback migrations if database changed
npm run migrate down

# Restart application
pm2 restart open-discuss

# Verify application is working
pm2 logs open-discuss
curl https://your-domain/health
```

## Support

For issues or questions:

- Check GitHub Issues: https://github.com/gilangheavy/open-discuss/issues
- Review application logs: `pm2 logs open-discuss`
- Review nginx logs: `sudo tail -f /var/log/nginx/error.log`
