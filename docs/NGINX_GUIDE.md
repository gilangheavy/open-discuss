# Nginx Configuration

This directory contains the Nginx reverse proxy configuration for the Forum API production server.

## Configuration File

**`nginx-server.conf`** - Production Nginx configuration with:

- HTTPS enforcement (TLS 1.2+)
- Rate limiting (90 requests/minute for `/threads`)
- Security headers (HSTS, X-Frame-Options, etc.)
- Connection limiting (10 concurrent per IP)
- HTTP to HTTPS redirect

## Features

### 1. Rate Limiting

- **Zone**: `one` (10MB memory, tracks ~160,000 IP addresses)
- **Rate**: 90 requests per minute per IP address
- **Burst**: 50 requests allowed in burst
- **Target**: `/threads` path and all nested paths (`/threads/*`)
- **Status Code**: Returns `429 Too Many Requests` when limit exceeded

### 2. Connection Limiting

- **Zone**: `addr` (10MB memory)
- **Limit**: Maximum 10 concurrent connections per IP address
- **Purpose**: Prevents connection exhaustion attacks

### 3. Security Headers

- **HSTS** (Strict-Transport-Security): Forces HTTPS for 1 year, including subdomains
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking (denies iframe embedding)
- **X-XSS-Protection**: Enables browser XSS protection

### 4. SSL/TLS Configuration

- **Protocol**: HTTPS only (HTTP redirects to HTTPS)
- **HTTP/2**: Enabled for better performance
- **Certificate**: Let's Encrypt SSL certificate
- **TLS Version**: 1.2+ (configured via `/etc/letsencrypt/options-ssl-nginx.conf`)

### 5. Request Body Limiting

- **Max Size**: 1 MB
- **Purpose**: Prevents large payload attacks

## Installation

### Step 1: Copy Configuration

```bash
# Copy the config file to Nginx sites-available
sudo cp nginx-server.conf /etc/nginx/sites-available/open-discuss

# Create symbolic link to sites-enabled
sudo ln -s /etc/nginx/sites-available/open-discuss /etc/nginx/sites-enabled/

# Remove default configuration (if exists)
sudo rm /etc/nginx/sites-enabled/default
```

### Step 2: Obtain SSL Certificate

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate (replace with your domain)
sudo certbot --nginx -d giant-frogs-brush-bravely.a276.dcdg.xyz -d www.giant-frogs-brush-bravely.a276.dcdg.xyz

# Certbot will automatically:
# - Generate SSL certificate
# - Configure SSL in Nginx
# - Setup auto-renewal
```

### Step 3: Test and Reload

```bash
# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

## Testing

### Test Rate Limiting

```bash
# Test /threads endpoint rate limiting
for i in {1..100}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://giant-frogs-brush-bravely.a276.dcdg.xyz/threads/thread-123
  sleep 0.3
done

# Expected: First 90 requests return 200/404, subsequent requests return 429
```

### Test HTTPS Enforcement

```bash
# Try HTTP connection (should redirect to HTTPS)
curl -I http://giant-frogs-brush-bravely.a276.dcdg.xyz

# Expected: HTTP/1.1 301 Moved Permanently
# Location: https://giant-frogs-brush-bravely.a276.dcdg.xyz/
```

### Test Security Headers

```bash
# Check security headers
curl -I https://giant-frogs-brush-bravely.a276.dcdg.xyz

# Expected headers:
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

### Test SSL/TLS

```bash
# Check SSL configuration
openssl s_client -connect giant-frogs-brush-bravely.a276.dcdg.xyz:443 -tls1_2

# Or use SSL Labs test:
# https://www.ssllabs.com/ssltest/analyze.html?d=giant-frogs-brush-bravely.a276.dcdg.xyz
```

## Monitoring

### View Access Logs

```bash
# Real-time access log
sudo tail -f /var/log/nginx/access.log

# Filter rate limit violations (429 errors)
sudo grep "429" /var/log/nginx/access.log
```

### View Error Logs

```bash
# Real-time error log
sudo tail -f /var/log/nginx/error.log

# Filter rate limiting messages
sudo grep "limiting requests" /var/log/nginx/error.log
```

### Check Nginx Status

```bash
# Check if Nginx is running
sudo systemctl status nginx

# Reload configuration without downtime
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx
```

## Troubleshooting

### Configuration Test Fails

```bash
# Test configuration with detailed output
sudo nginx -t -v

# Check for syntax errors
sudo nginx -c /etc/nginx/nginx.conf -t
```

### SSL Certificate Issues

```bash
# List all certificates
sudo certbot certificates

# Check certificate expiry
sudo certbot certificates | grep "Expiry Date"

# Manually renew certificates
sudo certbot renew

# Test renewal process (dry run)
sudo certbot renew --dry-run
```

### Rate Limiting Not Working

1. Check zone definition is before server block
2. Verify `limit_req` directive is in correct location block
3. Check Nginx error log for memory issues:
   ```bash
   sudo grep "zone" /var/log/nginx/error.log
   ```
4. Increase zone size if needed:
   ```nginx
   limit_req_zone $binary_remote_addr zone=one:20m rate=90r/m;
   ```

### 502 Bad Gateway Error

1. Check if application is running:
   ```bash
   pm2 status
   curl http://127.0.0.1:5000/health
   ```
2. Check if port 5000 is accessible:
   ```bash
   sudo lsof -i :5000
   ```
3. Check Nginx error log:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### Security Headers Not Showing

1. Verify `add_header` directives are in server block
2. Check if response is proxied correctly
3. Test with curl:
   ```bash
   curl -I https://your-domain.com
   ```
4. Some headers only appear on successful responses (2xx/3xx)

## Customization

### Adjust Rate Limit

```nginx
# Change from 90 to 120 requests per minute
limit_req_zone $binary_remote_addr zone=one:10m rate=120r/m;

# Change burst size
location /threads {
    limit_req zone=one burst=100 nodelay;
    # ...
}
```

### Add Rate Limiting to Other Endpoints

```nginx
# Create new zone for auth endpoints
limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/m;

# Apply to login endpoint
location /authentications {
    limit_req zone=auth burst=5 nodelay;
    # ... proxy settings
}
```

### Custom Error Pages

```nginx
# Add custom 429 error page
error_page 429 /429.json;

location = /429.json {
    internal;
    default_type application/json;
    return 429 '{"status":"fail","message":"Terlalu banyak permintaan. Coba lagi nanti."}';
}
```

### Enable Access Log for Rate Limiting

```nginx
# Log rate limit hits to separate file
limit_req_log_level warn;
limit_req_status 429;

# In http block:
map $status $loggable {
    ~^429$  1;
    default 0;
}

access_log /var/log/nginx/rate_limit.log combined if=$loggable;
```

## Performance Tuning

### Worker Processes

```nginx
# In /etc/nginx/nginx.conf
worker_processes auto;  # Use all CPU cores
worker_connections 1024;  # Connections per worker
```

### Proxy Buffers

```nginx
# Add to server or location block for better performance
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
proxy_busy_buffers_size 8k;
```

### Keepalive

```nginx
# In http block
keepalive_timeout 65;
keepalive_requests 100;
```

## Security Best Practices

1. **Keep Nginx Updated**

   ```bash
   sudo apt update && sudo apt upgrade nginx
   ```

2. **Hide Nginx Version**

   ```nginx
   # In http block of /etc/nginx/nginx.conf
   server_tokens off;
   ```

3. **Limit HTTP Methods**

   ```nginx
   # Only allow GET, POST, PUT, DELETE
   if ($request_method !~ ^(GET|POST|PUT|DELETE)$ ) {
       return 405;
   }
   ```

4. **Add CSP Header** (Content Security Policy)

   ```nginx
   add_header Content-Security-Policy "default-src 'self'" always;
   ```

5. **Enable Fail2Ban** for Nginx
   ```bash
   sudo apt install fail2ban
   # Configure /etc/fail2ban/jail.local for nginx-limit-req
   ```

## References

- [Nginx Rate Limiting Documentation](https://www.nginx.com/blog/rate-limiting-nginx/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)

## Support

For issues related to:

- **Nginx Configuration**: Check `/var/log/nginx/error.log`
- **SSL/TLS**: Run `sudo certbot certificates`
- **Rate Limiting**: Check `/var/log/nginx/access.log` for 429 errors
- **Application Issues**: Check `pm2 logs open-discuss`
