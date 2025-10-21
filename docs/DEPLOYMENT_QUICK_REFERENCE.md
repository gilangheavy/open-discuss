# Quick Deployment Reference

## GitHub Secrets Required

Configure these in: **Repository Settings → Secrets and variables → Actions**

| Secret Name    | Value Example                             |
| -------------- | ----------------------------------------- |
| `SSH_HOST`     | `giant-frogs-brush-bravely.a276.dcdg.xyz` |
| `SSH_USERNAME` | `ubuntu`                                  |
| `SSH_KEY`      | `-----BEGIN OPENSSH PRIVATE KEY-----...`  |
| `SSH_PORT`     | `22`                                      |

## Generate SSH Key Pair

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key

# Display private key (copy to GitHub secret SSH_KEY)
cat ~/.ssh/github_deploy_key

# Display public key (add to server's authorized_keys)
cat ~/.ssh/github_deploy_key.pub
```

## Server Setup Checklist

```bash
# 1. Clone repository
cd ~
git clone https://github.com/gilangheavy/open-discuss.git
cd open-discuss

# 2. Install dependencies
npm install

# 3. Create .env file
nano .env
# Add: HOST, PORT, JWT keys, PostgreSQL credentials

# 4. Setup database
sudo -u postgres psql
# CREATE DATABASE forumapi;
# CREATE USER forumapi_user WITH ENCRYPTED PASSWORD 'password';
# GRANT ALL PRIVILEGES ON DATABASE forumapi TO forumapi_user;

# 5. Run migrations
npm run migrate up

# 6. Start with PM2
pm2 start src/app.js --name open-discuss
pm2 save
pm2 startup

# 7. Configure Nginx
sudo cp config/nginx/nginx-server.conf /etc/nginx/sites-available/open-discuss
sudo ln -s /etc/nginx/sites-available/open-discuss /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 8. Setup SSL
sudo certbot --nginx -d giant-frogs-brush-bravely.a276.dcdg.xyz
```

## Deployment Flow

```
Developer → Create PR → CI runs (lint, test, audit)
                ↓
           CI passes → Review & Merge to master
                ↓
           CD triggers → SSH to server
                ↓
         git pull → npm install → migrate → pm2 restart
                ↓
           ✅ Deployed!
```

## Manual Deployment

```bash
# SSH to server
ssh user@server-ip

# Navigate to project
cd ~/open-discuss

# Deploy manually
git pull origin master
npm install
npm run migrate up
pm2 restart open-discuss
pm2 logs open-discuss
```

## Verify Deployment

```bash
# Check application status
pm2 status
pm2 logs open-discuss --lines 50

# Test health endpoint
curl https://giant-frogs-brush-bravely.a276.dcdg.xyz/health

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

## Troubleshooting

```bash
# View logs
pm2 logs open-discuss
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart open-discuss
sudo systemctl reload nginx

# Check database
psql -U forumapi_user -d forumapi -c "SELECT NOW();"

# Test connection
curl http://localhost:5000/health
```

## Rate Limiting Test

```bash
# Test /threads rate limiting (90 req/min)
for i in {1..100}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    https://giant-frogs-brush-bravely.a276.dcdg.xyz/threads/test
  sleep 0.3
done

# Expected: 200/404 for first 90, then 429
```

## Rollback

```bash
# SSH to server
ssh user@server-ip
cd ~/open-discuss

# Find last working commit
git log --oneline -n 10

# Rollback
git reset --hard <commit-hash>
npm install
npm run migrate down  # if needed
pm2 restart open-discuss
```

## Important Files

- **CD Workflow**: `.github/workflows/cd.yaml`
- **CI Workflow**: `.github/workflows/ci.yaml`
- **Nginx Config**: `config/nginx/nginx-server.conf`
- **Deployment Guide**: `.github/DEPLOYMENT.md`
- **Nginx README**: `config/nginx/README.md`

## Security Checklist

- ✅ HTTPS enforced (HTTP → HTTPS redirect)
- ✅ Rate limiting: 90 req/min on `/threads`
- ✅ Connection limit: 10 per IP
- ✅ Security headers: HSTS, X-Frame-Options, etc.
- ✅ Request body limit: 1MB
- ✅ SSL/TLS with Let's Encrypt
- ✅ HTTP/2 enabled
- ✅ SSH key authentication (no password)
- ✅ Environment variables in `.env` (not committed)
- ✅ Strong JWT secrets (32+ chars)

## Support

- **Deployment docs**: `.github/DEPLOYMENT.md`
- **Nginx docs**: `config/nginx/README.md`
- **Application logs**: `pm2 logs open-discuss`
- **Nginx logs**: `/var/log/nginx/error.log`
- **GitHub Actions**: Repository → Actions tab
