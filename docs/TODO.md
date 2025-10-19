# Project TODO List

This document tracks the remaining tasks, planned features, and known issues for the Forum API project. It is based on the project's Product Requirements Document (PRD).

---

## ✅ Completed Core Features (Mandatory)

### User Management

- ✅ User registration with bcrypt password hashing
- ✅ User login with JWT (access + refresh token)
- ✅ Refresh access token functionality
- ✅ User logout (delete refresh token)

### Thread Management

- ✅ Create thread (authenticated)
- ✅ View thread details with comments and replies
- ✅ Thread ownership tracking

### Comment Management

- ✅ Add comment to thread (authenticated)
- ✅ Delete comment - soft delete (authenticated, owner only)
- ✅ Display deleted comments as "**komentar telah dihapus**"
- ✅ Comments sorted by date ascending

### Architecture & Testing

- ✅ Clean Architecture implementation (4 layers: Entities, Use Cases, Interface Adapters, Frameworks)
- ✅ 100% test coverage (170 tests passing)
- ✅ Unit tests for all business logic
- ✅ Integration tests for repositories
- ✅ End-to-end tests for HTTP endpoints
- ✅ SQL injection prevention (parameterized queries)

---

## ✅ Completed Optional Features

### Replies (Optional Feature 1 & 2)

- ✅ Add reply to comment (authenticated)
- ✅ Delete reply - soft delete (authenticated, owner only)
- ✅ Display deleted replies as "**balasan telah dihapus**"
- ✅ Replies sorted by date ascending
- ✅ Replies included in thread detail response

---

## 🚧 Immediate Tasks (CI/CD & Security - MANDATORY for Course)

### CI/CD Implementation (HIGH PRIORITY)

- [ ] **Create GitHub Actions workflow file** (`.github/workflows/ci.yml`)

  - [ ] Configure PostgreSQL service container (postgres:17)
  - [ ] Add lint job (`npm run lint`)
  - [ ] Add test job with test database (`npm test`)
  - [ ] Add coverage verification (must be 100%)
  - [ ] Add security audit job (`npm audit`)
  - [ ] Configure environment variables for CI

- [ ] **Enable Branch Protection Rules**

  - [ ] Protect `master` branch
  - [ ] Protect `development` branch
  - [ ] Require PR reviews before merge
  - [ ] Require status checks to pass (lint, test, coverage, audit)
  - [ ] Require branches to be up to date

- [ ] **Update workflow configuration**
  - [ ] Fix Node.js version (currently set to "2", should be "22")
  - [ ] Verify PostgreSQL connection settings
  - [ ] Test workflow runs successfully

### Security Implementation (HIGH PRIORITY)

- [ ] **Configure Nginx reverse proxy**

  - [ ] Create nginx configuration file (`/etc/nginx/sites-available/forumapi`)
  - [ ] Implement rate limiting zones:
    - [ ] General API: 100 requests/minute
    - [ ] Login endpoint: 10 requests/minute
  - [ ] Configure connection limits (10 concurrent per IP)
  - [ ] Set max request body size (1MB)

- [ ] **Setup SSL/TLS with Let's Encrypt**

  - [ ] Install certbot
  - [ ] Obtain SSL certificate
  - [ ] Configure HTTPS redirect (HTTP → HTTPS)
  - [ ] Enable TLS 1.2+ only
  - [ ] Configure strong cipher suites

- [ ] **Add Security Headers**

  - [ ] Strict-Transport-Security (HSTS)
  - [ ] X-Content-Type-Options (nosniff)
  - [ ] X-Frame-Options (DENY)
  - [ ] X-XSS-Protection

- [ ] **Verify SQL Injection Prevention**

  - [ ] Code review all repository methods
  - [ ] Ensure all queries use parameterized format ($1, $2, ...)
  - [ ] No string concatenation in SQL queries
  - [ ] Document verification in code review checklist

- [ ] **Custom Error Pages (Nginx)**
  - [ ] 429 Rate Limit Exceeded (JSON response in Indonesian)
  - [ ] 502/503/504 Server errors (JSON response)

### API Documentation Implementation (HIGH PRIORITY - MANDATORY)

- [ ] **Install Dependencies**

  - [ ] Install `hapi-swagger` package
  - [ ] Install `@hapi/inert` (static file serving)
  - [ ] Install `@hapi/vision` (template rendering)
  - [ ] Install `joi` (if not already installed)

- [ ] **Configure Swagger in Server**

  - [ ] Add Swagger plugin registration in `createServer.js`
  - [ ] Configure Swagger options (title, version, description, contact)
  - [ ] Define tags (users, authentications, threads, comments, replies, likes)
  - [ ] Setup JWT security definition for Swagger
  - [ ] Configure grouping and sorting

- [ ] **Document All Endpoints with Joi Validation**

  - [ ] **Users Endpoints:**
    - [ ] `POST /users` - Add validation schemas and response documentation
  - [ ] **Authentication Endpoints:**
    - [ ] `POST /authentications` - Login
    - [ ] `PUT /authentications` - Refresh token
    - [ ] `DELETE /authentications` - Logout
  - [ ] **Thread Endpoints:**
    - [ ] `POST /threads` - Create thread
    - [ ] `GET /threads/{threadId}` - Get thread details
  - [ ] **Comment Endpoints:**
    - [ ] `POST /threads/{threadId}/comments` - Add comment
    - [ ] `DELETE /threads/{threadId}/comments/{commentId}` - Delete comment
  - [ ] **Reply Endpoints (Optional):**
    - [ ] `POST /threads/{threadId}/comments/{commentId}/replies` - Add reply
    - [ ] `DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}` - Delete reply
  - [ ] **Like Endpoints (Optional):**
    - [ ] `PUT /threads/{threadId}/comments/{commentId}/likes` - Toggle like

- [ ] **Add Validation Schemas**

  - [ ] Define Joi schemas for all request payloads
  - [ ] Define Joi schemas for all path parameters
  - [ ] Define Joi schemas for all response bodies
  - [ ] Add examples for each schema
  - [ ] Add descriptions for each field

- [ ] **Test Documentation**
  - [ ] Start server and access `/documentation` endpoint
  - [ ] Verify all endpoints are listed
  - [ ] Test "Try it out" feature for each endpoint
  - [ ] Test JWT authentication in Swagger UI
  - [ ] Verify response examples are correct
  - [ ] Verify OpenAPI spec at `/swagger.json`

---

## 🎯 Remaining Optional Features

### Comment Likes (Optional Feature 3)

- [ ] Create `comment_likes` table migration
  - [ ] Fields: id, comment_id, owner, created_at
  - [ ] UNIQUE constraint on (comment_id, owner)
  - [ ] Foreign keys with CASCADE delete
- [ ] Create CommentLike domain entities
- [ ] Implement LikeRepository (abstract + Postgres)
- [ ] Create LikeUseCase (toggle like/unlike)
- [ ] Add like/unlike endpoint: `PUT /threads/{threadId}/comments/{commentId}/likes`
- [ ] Include `likeCount` in thread detail response
- [ ] Write unit tests for LikeUseCase
- [ ] Write integration tests for LikeRepository
- [ ] Write E2E tests for like endpoint

---

## 📋 Production Deployment Checklist

### Infrastructure Setup

- [ ] Setup production server (VPS/Cloud)
- [ ] Install and configure Nginx (with config from PRD Section 11.3)
- [ ] Install PostgreSQL 17
- [ ] Setup SSL certificate with Let's Encrypt
- [ ] Configure firewall rules (allow 80, 443, block direct access to 5000)

### Application Deployment

- [ ] Setup production environment variables
- [ ] Configure PM2 or similar process manager
- [ ] Run database migrations on production
- [ ] Setup automated backups for PostgreSQL
- [ ] Configure log rotation

### Monitoring & Observability

- [ ] Implement health check endpoint (`GET /health`)
- [ ] Setup monitoring for:
  - [ ] API response times
  - [ ] Error rates
  - [ ] Database connection pool
  - [ ] Memory usage
  - [ ] Disk space
- [ ] Configure log aggregation (optional: ELK stack, Papertrail)
- [ ] Setup error tracking (optional: Sentry)

### Security Hardening

- [ ] Rotate JWT secrets
- [ ] Setup fail2ban for SSH
- [ ] Configure database access restrictions (local only)
- [ ] Enable PostgreSQL SSL connections
- [ ] Regular security updates (unattended-upgrades)

---

## 🔮 Future Enhancements (Out of Scope)

These features were listed as "Out of Scope" in the current PRD but are potential candidates for future versions.

### Core Functionality

- [ ] Implement password reset/forgot password functionality
- [ ] Implement user profile management (update fullname, password)
- [ ] Add search functionality for threads and comments
- [ ] Implement pagination for thread lists and comment lists
- [ ] Allow editing of threads/comments/replies

### Community & Moderation

- [ ] Add Admin/Moderator roles and features
- [ ] Implement content moderation tools (flagging, review queues)
- [ ] Add a user blocking/reporting system
- [ ] Implement a content flagging system
- [ ] Add thread voting/ranking
- [ ] Implement a user reputation system

### User Experience

- [ ] Add email verification on registration
- [ ] Implement email and/or push notifications
- [ ] Add support for thread categories or tags
- [ ] Allow user avatars/profile pictures
- [ ] Implement private messaging between users
- [ ] Add support for OAuth/social login (Google, GitHub)

---

## 🛠 Known Issues & Technical Debt

### Database

- [ ] **Soft Delete Cleanup**: Soft-deleted data accumulates. Implement scheduled cleanup job or archiving strategy
- [ ] **Missing Indexes**: Add recommended indexes from PRD Section 4.7:
  - [ ] `CREATE INDEX idx_comments_thread_id ON comments(thread_id)`
  - [ ] `CREATE INDEX idx_replies_comment_id ON replies(comment_id)`
  - [ ] `CREATE INDEX idx_threads_date ON threads(date DESC)`
  - [ ] `CREATE INDEX idx_comments_date ON comments(date ASC)`

### Performance

- [ ] **N+1 Query Problem**: Thread detail endpoint might have N+1 queries for comments/replies
- [ ] **No Caching**: Consider Redis for frequently accessed threads
- [ ] **No Connection Pooling Monitoring**: Add metrics for pool usage

### Code Quality

- [ ] **Error Messages Consistency**: Some error messages in Indonesian, some in English
- [ ] **Magic Numbers**: Some hardcoded values (salt rounds, limits) should be in config
- [ ] **Presentation Logic in Handler**: Thread detail formatting could be in presenter layer

### Security

- [ ] **No Request ID Tracking**: Add request IDs for debugging
- [ ] **No API Versioning**: Future breaking changes will be difficult
- [ ] **Refresh Token Rotation**: Implement token rotation for better security

### Real-time Features

- [ ] **Real-time Notifications**: No WebSocket support for live updates
- [ ] **Live Comment Updates**: Comments don't refresh automatically

---

## 📊 Project Status Summary

**Overall Progress: ~80% Complete**

| Category               | Status      | Completion |
| ---------------------- | ----------- | ---------- |
| Mandatory Features     | ✅ Complete | 100% (6/6) |
| Optional Features      | 🔄 Partial  | 67% (2/3)  |
| Testing & Architecture | ✅ Complete | 100%       |
| CI/CD Implementation   | ❌ Todo     | 0%         |
| Security (Nginx, SSL)  | ❌ Todo     | 0%         |
| **API Documentation**  | ❌ **Todo** | **0%**     |
| Production Deployment  | ❌ Todo     | 0%         |

**Next Priority Actions:**

1. 🔴 **CRITICAL**: Fix GitHub Actions workflow (Node.js version)
2. 🔴 **CRITICAL**: Implement Hapi-Swagger API Documentation
3. 🔴 **CRITICAL**: Implement Nginx configuration with rate limiting
4. 🔴 **CRITICAL**: Setup SSL/TLS with Let's Encrypt
5. 🟡 **HIGH**: Enable branch protection rules
6. 🟡 **HIGH**: Verify SQL injection prevention in code review
7. 🟢 **MEDIUM**: Implement Comment Likes feature (optional #3)
8. 🟢 **MEDIUM**: Add database indexes for performance

---

## 📝 Notes

- **Course Requirements**: CI/CD, Security, and **API Documentation** are **MANDATORY** for course evaluation
- **API Documentation Tool**: Use **hapi-swagger** for OpenAPI 3.0 generation
- **PRD Reference**: See `docs/PRD.md` Section 3.7 and 11.5 for specifications
- **Coverage Target**: Must maintain 100% test coverage
- **SQL Injection**: All repository methods already use parameterized queries ✅
- **GitHub Actions**: Workflow file exists (`.github/workflows/main.yaml`) but needs fixes
- **Swagger UI**: Will be accessible at `/documentation` endpoint after implementation
