# Product Requirements Document: Forum API API

## 1. Introduction

### 1.1. Project Vision

**Garuda Game**, a highly successful online gaming company, aims to enhance its community engagement by building a dedicated discussion forum for its millions of players. This official platform will provide a centralized and comfortable space for users to discuss games, share experiences, and connect with each other.

The forum application will be available on both web and native mobile platforms. To ensure long-term success, the back-end API must be built on a foundation of **Clean Architecture** and be accompanied by a robust **automated testing** suite. This will guarantee the application is scalable, maintainable, and adaptable to future technological changes.

### 1.2. Target Audience

The primary users are players of Garuda Game's titles who want to participate in community discussions.

## 2. Core Features

The initial version of the Forum API will support the following features:

### 2.1. Mandatory Features

- **User Registration**
- **User Login & Logout** (Authentication)
- **Add a Thread**
- **View a Thread** (with comments)
- **Add a Comment** to a thread
- **Delete a Comment** from a thread

### 2.2. Optional Features

- **Add a Reply** to a comment
- **Delete a Reply**
- **Like/Unlike a Comment**

## 3. Non-Functional Requirements

### 3.1. Architecture & Testing

- **Clean Architecture**: The codebase must be layered into `Entities`, `Use Cases`, `Interface Adapters` (Repositories, Handlers), and `Frameworks` (Database, HTTP Server).
- **Automation Testing**:
  - **Unit Tests**: Must be implemented for all business logic in Entities and Use Cases.
  - **Integration Tests**: Must be implemented to verify the interaction between the database and repositories.

### 3.2. Performance

- **Read Operations**: P95 response time < 200ms.
- **Write Operations**: P95 response time < 500ms.
- **Throughput**: Minimum 1000 requests/second.
- **Database**: Query timeout of max 5 seconds.

### 3.3. Scalability

- **Stateless API**: The API must be stateless to allow for horizontal scaling.
- **Connection Pooling**: Max 100 database connections.
- **Concurrency**: Support a minimum of 10,000 active users.

### 3.4. Availability

- **Uptime**: 99.9% target (max 8.76 hours of downtime per year).
- **Health Check**: A `GET /health` endpoint must be available.

### 3.5. Security

- **Transport**: HTTPS only (TLS 1.2+).
- **Rate Limiting**:
  - **Application Level**: 100 requests/minute per user.
  - **Infrastructure Level**: Implemented via Nginx reverse proxy.
  - Configuration: `limit_req_zone` and `limit_req` directives.
- **SQL Injection Prevention**:
  - **Mandatory**: Use parameterized queries/prepared statements only.
  - All database operations must use query parameters, never string concatenation.
  - Example: `pool.query('SELECT * FROM users WHERE id = $1', [userId])`.
- **Input Validation**: All input must be validated and sanitized to prevent XSS attacks.
- **CORS**: Must be configured for specified origins only.

### 3.6. CI/CD Requirements

- **Continuous Integration**:

  - **Platform**: GitHub Actions (mandatory).
  - **Trigger**: Automated on every push and pull request.
  - **Pipeline Steps**:
    1. Install dependencies (`npm ci`)
    2. Run linter (`npm run lint` - must pass with zero errors)
    3. Run tests (`npm test` - all tests must pass)
    4. Check test coverage (must achieve 100% coverage)
    5. Security audit (`npm audit` - no high/critical vulnerabilities)
  - **Branch Protection**: Pull requests must pass all CI checks before merge.

- **Continuous Deployment** (Optional for Production):
  - Automated deployment to staging/production after CI passes.
  - Database migrations run automatically.
  - Health check verification post-deployment.
  - Rollback mechanism in case of failures.

### 3.7. API Documentation Requirements

- **Documentation Tool**: Hapi-Swagger (mandatory).
- **OpenAPI Specification**: Must generate OpenAPI 3.0 compliant documentation.
- **Interactive Documentation**: Swagger UI accessible at `/documentation` endpoint.
- **Coverage**: All API endpoints must be documented with:
  - **Request schemas**: All request body, query parameters, and path parameters
  - **Response schemas**: Success and error responses
  - **Authentication requirements**: Indicate which endpoints require JWT
  - **Examples**: Provide example requests and responses
  - **Descriptions**: Clear descriptions for each endpoint
- **Tags**: Endpoints grouped by resource type (Users, Authentications, Threads, Comments, Replies, Likes)
- **Auto-generation**: Documentation automatically generated from route validation schemas (Joi)
- **Version Information**: API version and contact information included

---

## 4. Database Schema

The database schema is detailed in the [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) document. The schema is managed via migration files located in the `/migrations` directory.

## 5. API Specification

### 5.1. Authentication

- **Method**: JWT (JSON Web Tokens).
- **Access Token**:
  - **Algorithm**: HS256
  - **Payload**: `{ id, username, iat, exp }`
  - **Expiration**: 1 hour (configurable via `ACCESS_TOKEN_AGE` env var).
  - **Secret Key**: Stored in `ACCESS_TOKEN_KEY` environment variable.
  - **Usage**: Sent in the `Authorization: Bearer <token>` header for protected resources.
- **Refresh Token**:
  - **Algorithm**: HS256
  - **Payload**: `{ id, username, iat, exp }`
  - **Storage**: Persisted in the `authentications` database table.
  - **Expiration**: 7 days (or longer, no explicit expiration enforced).
  - **Secret Key**: Stored in `REFRESH_TOKEN_KEY` environment variable.
  - **Usage**: Used to request a new access token via `PUT /authentications`. It is invalidated upon logout.

#### Protected Endpoints

The following endpoints require a valid access token in the `Authorization` header:

- `POST /threads`
- `POST /threads/{threadId}/comments`
- `DELETE /threads/{threadId}/comments/{commentId}`
- `POST /threads/{threadId}/comments/{commentId}/replies` (Optional)
- `DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}` (Optional)
- `PUT /threads/{threadId}/comments/{commentId}/likes` (Optional)
- `PUT /authentications` (refresh token)
- `DELETE /authentications` (logout)

### 5.2. Error Responses

All error responses must conform to the following structure:

```json
{
  "status": "fail",
  "message": "A descriptive, human-readable error message."
}
```

#### Standard Error Codes

| HTTP Status | Error Scenario            | Message (Indonesian)                                                              |
| ----------- | ------------------------- | --------------------------------------------------------------------------------- |
| **400**     | Missing required field    | `"Tidak dapat membuat {resource} baru karena properti yang dibutuhkan tidak ada"` |
| **400**     | Invalid data type         | `"Tidak dapat membuat {resource} baru karena tipe data tidak sesuai"`             |
| **400**     | Username already exists   | `"Username tidak tersedia"`                                                       |
| **400**     | Invalid payload structure | `"Payload tidak mengandung {field}"`                                              |
| **401**     | Missing authentication    | `"Missing authentication"`                                                        |
| **401**     | Invalid credentials       | `"Kredensial yang Anda masukkan salah"`                                           |
| **401**     | Invalid/expired token     | `"Refresh token tidak valid"`                                                     |
| **403**     | Not resource owner        | `"Anda tidak berhak mengakses resource ini"`                                      |
| **404**     | Thread not found          | `"Thread tidak ditemukan"`                                                        |
| **404**     | Comment not found         | `"Komentar tidak ditemukan"`                                                      |
| **404**     | Reply not found           | `"Balasan tidak ditemukan"`                                                       |
| **404**     | User not found            | `"User tidak ditemukan"`                                                          |
| **500**     | Server error              | `"Terjadi kegagalan pada server kami"`                                            |

---

### 4.3. Input Validation Rules

All API endpoints must enforce the following validation rules:

#### User Registration (`POST /users`)

- **username**:
  - Required
  - Type: `string`
  - Min length: 3 characters
  - Max length: 50 characters
  - Pattern: Alphanumeric only (a-z, A-Z, 0-9, underscore)
  - Must be unique (case-insensitive)
- **password**:
  - Required
  - Type: `string`
  - Min length: 8 characters
  - Stored as bcrypt hash (salt rounds: 10)
- **fullname**:
  - Required
  - Type: `string`
  - Min length: 1 character
  - Max length: 255 characters

#### Login (`POST /authentications`)

- **username**: Required, string
- **password**: Required, string

#### Thread Creation (`POST /threads`)

- **title**:
  - Required
  - Type: `string`
  - Min length: 1 character
  - Max length: 50 characters
- **body**:
  - Required
  - Type: `string`
  - Min length: 1 character
  - Max length: 10,000 characters

#### Comment Creation (`POST /threads/{threadId}/comments`)

- **content**:
  - Required
  - Type: `string`
  - Min length: 1 character
  - Max length: 5,000 characters

#### Reply Creation (`POST /threads/{threadId}/comments/{commentId}/replies`)

- **content**:
  - Required
  - Type: `string`
  - Min length: 1 character
  - Max length: 5,000 characters

#### General Validation Rules

- All string inputs must be trimmed of leading/trailing whitespace
- Reject requests with unknown/extra properties
- Content-Type must be `application/json` for POST/PUT requests
- Request body max size: 1 MB
- All path parameters (threadId, commentId, replyId) must be valid format

---

### 5.4. API Endpoints

#### **Authentication**

##### `POST /users` - Register User

- **Authentication**: Not required.
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "fullname": "string"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "data": {
      "addedUser": {
        "id": "user-DWrT3pXe1hccYkV1eIAxS",
        "username": "dicoding",
        "fullname": "Dicoding Indonesia"
      }
    }
  }
  ```

##### `POST /authentications` - Login

- **Authentication**: Not required.
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

##### `PUT /authentications` - Refresh Access Token

- **Authentication**: Not required (but needs valid refresh token).
- **Request Body**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

##### `DELETE /authentications` - Logout

- **Authentication**: Not required (but needs valid refresh token).
- **Request Body**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success"
  }
  ```

---

#### **Threads**

##### `POST /threads` - Add a Thread

- **Authentication**: Required.
- **Request Body**:
  ```json
  {
    "title": "string",
    "body": "string"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "data": {
      "addedThread": {
        "id": "thread-h_W1Plfpj0TY7wyT2PUPX",
        "title": "a thread title",
        "owner": "user-DWrT3pXe1hccYkV1eIAxS"
      }
    }
  }
  ```

##### `GET /threads/{threadId}` - Get Thread Details

- **Authentication**: Not required.
- **Success Response (200 OK)**:
  - Comments must be sorted by their creation date in **ascending** order.
  - Deleted comments should have their content replaced with `**komentar telah dihapus**`.
  - (Optional) Replies should be included, sorted by creation date, with deleted replies' content replaced by `**balasan telah dihapus**`.
  - (Optional) `likeCount` should be included for each comment.
  ```json
  {
    "status": "success",
    "data": {
      "thread": {
        "id": "thread-h_2FkLZhtgBKY2kh4CC02",
        "title": "a thread title",
        "body": "the body of the thread",
        "date": "2021-08-08T07:19:09.775Z",
        "username": "dicoding",
        "comments": [
          {
            "id": "comment-_pby2_tmXV6bcvcdev8xk",
            "username": "johndoe",
            "date": "2021-08-08T07:22:33.555Z",
            "content": "a comment",
            "likeCount": 0,
            "replies": []
          },
          {
            "id": "comment-yksuCoxM2s4MMrZJO-qVD",
            "username": "dicoding",
            "date": "2021-08-08T07:26:21.338Z",
            "content": "**komentar telah dihapus**",
            "likeCount": 0,
            "replies": []
          }
        ]
      }
    }
  }
  ```

---

#### **Comments**

##### `POST /threads/{threadId}/comments` - Add a Comment

- **Authentication**: Required.
- **Request Body**:
  ```json
  {
    "content": "string"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "data": {
      "addedComment": {
        "id": "comment-_pby2_tmXV6bcvcdev8xk",
        "content": "a comment",
        "owner": "user-CrkY5iAgOdMqv36bIvys2"
      }
    }
  }
  ```

##### `DELETE /threads/{threadId}/comments/{commentId}` - Delete a Comment

- **Authentication**: Required.
- **Authorization**: Only the owner of the comment can delete it.
- **Behavior**: This is a **soft delete**. The comment content should be masked in the database (e.g., via an `is_deleted` flag), not physically removed.
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success"
  }
  ```

---

#### **Replies (Optional)**

##### `POST /threads/{threadId}/comments/{commentId}/replies` - Add a Reply

- **Authentication**: Required.
- **Request Body**:
  ```json
  {
    "content": "string"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "data": {
      "addedReply": {
        "id": "reply-BErOXUSefjwWGW1Z10Ihk",
        "content": "a reply",
        "owner": "user-CrkY5iAgOdMqv36bIvys2"
      }
    }
  }
  ```

##### `DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}` - Delete a Reply

- **Authentication**: Required.
- **Authorization**: Only the owner of the reply can delete it.
- **Behavior**: This is a **soft delete**.
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success"
  }
  ```

---

#### **Likes (Optional)**

##### `PUT /threads/{threadId}/comments/{commentId}/likes` - Like or Unlike a Comment

- **Authentication**: Required.
- **Behavior**: This endpoint acts as a toggle. If the user has not liked the comment, it adds a like. If the user has already liked it, it removes the like.
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success"
  }
  ```

---

## 6. Testing Requirements

### 6.1. Test Coverage

- **Minimum Coverage**: 100% for statements, functions, and lines.
- **Branch Coverage**: Target 100%, minimum 95%.
- **Coverage Tool**: Jest with Istanbul.
- **Coverage Report**: Must be generated and reviewed before deployment.

### 6.2. Test Types

#### Unit Tests

- **Scope**: All business logic in Entities and Use Cases.
- **Requirements**:
  - Test all entity validation rules
  - Test all use case flows (happy path and error scenarios)
  - Mock all external dependencies (repositories, security helpers)
  - Test error throwing and error messages
  - 100% coverage required

#### Integration Tests

- **Scope**: Repository implementations and database interactions.
- **Requirements**:
  - Test all repository methods
  - Use actual test database (not mocks)
  - Verify database constraints (foreign keys, unique constraints)
  - Test transaction rollback scenarios
  - Clean database state before each test
  - Use test helpers (ThreadsTableTestHelper, etc.)

#### End-to-End Tests (Recommended)

- **Scope**: Full HTTP request/response cycle.
- **Requirements**:
  - Test complete flows (register → login → create thread → add comment, etc.)
  - Test authentication/authorization
  - Test error responses (400, 401, 403, 404)
  - Verify response structure and status codes
  - Test soft delete behavior

### 6.3. Test Environment

- **Database**: Separate test database (configured via `PG*_TEST` env vars)
- **Isolation**: Each test suite should clean up after itself
- **Fixtures**: Use consistent test data (users, threads, comments)
- **Migrations**: Run migrations before tests (`npm run migrate:test`)

### 6.4. Continuous Integration

- All tests must pass before merge to master branch
- Coverage report uploaded to CI/CD
- No decrease in coverage allowed
- Automated testing on every pull request

---

## 7. Acceptance Criteria

### 7.1. Functional Completeness

**Mandatory Features:**

- ✅ User can register with username, password, and fullname
- ✅ User can login and receive access token + refresh token
- ✅ User can refresh access token using refresh token
- ✅ User can logout (invalidate refresh token)
- ✅ Authenticated user can create a thread
- ✅ Anyone can view thread details with all comments
- ✅ Authenticated user can add comment to a thread
- ✅ Comment owner can delete their own comment (soft delete)
- ✅ Deleted comments show as "**komentar telah dihapus**"
- ✅ Comments are sorted by date ascending

**Optional Features (Minimum 2 of 3):**

- ⭕ Authenticated user can add reply to a comment
- ⭕ Reply owner can delete their own reply (soft delete)
- ⭕ Deleted replies show as "**balasan telah dihapus**"
- ⭕ Replies are sorted by date ascending
- ⭕ Authenticated user can like/unlike a comment (toggle)
- ⭕ Comment `likeCount` is displayed in thread details

### 7.2. Quality Gates

**Code Quality:**

- ✅ 100% test coverage (statements, functions, lines)
- ✅ 95%+ branch coverage
- ✅ All tests passing (unit + integration + e2e)
- ✅ Zero ESLint errors
- ✅ Clean Architecture layers strictly enforced:
  - Entities contain only data validation
  - Use Cases contain only business logic
  - Repositories return data only (no business errors thrown)
  - Handlers coordinate request/response only
- ✅ No code duplication (DRY principle)

**Security:**

- ✅ Passwords stored as bcrypt hash (never plain text)
- ✅ JWT secrets stored in environment variables
- ✅ SQL injection prevention (prepared statements/parameterized queries verified in all repository methods)
- ✅ Rate limiting configured in Nginx (100 req/min general, 10 req/min for login)
- ✅ Input validation on all endpoints
- ✅ Authorization checks (user can only delete own content)
- ✅ No sensitive data in logs or error messages
- ✅ HTTPS enforced (TLS 1.2+)
- ✅ Security headers configured (HSTS, X-Content-Type-Options, etc.)

**CI/CD (Mandatory):**

- ✅ GitHub Actions workflow configured (`.github/workflows/ci.yml`)
- ✅ Automated testing on every push and pull request
- ✅ All CI checks must pass:
  - ESLint (zero errors)
  - All tests pass (170 tests)
  - 100% test coverage
  - npm audit clean (no high/critical vulnerabilities)
- ✅ Branch protection enabled on `master` and `development`
- ✅ Pull request reviews required before merge
- ✅ PostgreSQL service container configured for integration tests

**API Documentation (Mandatory):**

- ✅ Hapi-Swagger installed and configured
- ✅ Swagger UI accessible at `/documentation` endpoint
- ✅ OpenAPI 3.0 specification generated
- ✅ All endpoints documented with:
  - Tags for grouping (users, authentications, threads, comments, replies, likes)
  - Request validation schemas (Joi)
  - Response schemas for all status codes
  - Examples for requests and responses
  - Description and notes
- ✅ JWT authentication documented in Swagger
- ✅ API version and contact information included

**Performance (Development Environment):**

- ✅ GET /threads/{threadId} response time < 200ms (P95)
- ✅ POST endpoints response time < 500ms (P95)
- ✅ Database queries optimized (no N+1 queries)

### 7.3. Documentation

- ✅ README.md with complete setup instructions
- ✅ Environment variables documented
- ✅ API endpoints documented with examples
- ✅ Migration instructions clear
- ✅ Test execution instructions provided
- ✅ **Interactive API documentation (Swagger UI) at `/documentation`**
- ✅ **OpenAPI 3.0 specification generated and accessible**
- ✅ **All endpoints include Joi validation schemas**

### 7.4. API Compliance

**Request/Response Format:**

- ✅ All success responses include `{ "status": "success", "data": {...} }`
- ✅ All error responses include `{ "status": "fail", "message": "..." }`
- ✅ Correct HTTP status codes (201 for create, 200 for success, 4xx for client errors)
- ✅ Content-Type: application/json

**Error Handling:**

- ✅ 400 for validation errors with descriptive message
- ✅ 401 for authentication failures
- ✅ 403 for authorization failures (not owner)
- ✅ 404 for non-existent resources
- ✅ 500 for server errors with generic message (no stack traces exposed)

**Data Integrity:**

- ✅ Foreign key constraints enforced
- ✅ Soft delete implemented (is_delete flag)
- ✅ Timestamps auto-generated
- ✅ Unique constraints enforced (username, like per user per comment)
- ✅ Cascade delete configured (deleting thread deletes comments/replies)

---

## 8. Environment Configuration

### 8.1. Required Environment Variables

```bash
# Server Configuration
HOST=localhost
PORT=5000

# JWT Configuration
ACCESS_TOKEN_KEY=<secret_key_for_access_token>
ACCESS_TOKEN_AGE=3600
REFRESH_TOKEN_KEY=<secret_key_for_refresh_token>

# PostgreSQL - Development
PGHOST=localhost
PGPORT=5432
PGUSER=developer
PGPASSWORD=<your_password>
PGDATABASE=forumapi

# PostgreSQL - Testing
PGHOST_TEST=localhost
PGPORT_TEST=5432
PGUSER_TEST=developer
PGPASSWORD_TEST=<your_password>
PGDATABASE_TEST=forumapi_test

# Application Environment
NODE_ENV=development
```

### 8.2. Security Considerations

- **Never commit `.env` file to version control**
- **Use strong, unique secrets for JWT keys** (minimum 32 characters, randomly generated)
- **Different secrets for development, staging, and production**
- **Rotate JWT secrets periodically in production**
- **Use environment-specific database credentials**

---

## 9. Success Metrics

### 9.1. Project Completion

The project is considered complete when:

1. All 6 mandatory features are implemented and tested
2. At least 2 of 3 optional features are implemented
3. All acceptance criteria in Section 7 are met
4. Code review passes (Clean Architecture compliance)
5. 100% test coverage achieved
6. **CI/CD pipeline configured and operational** (GitHub Actions)
7. **All security measures implemented** (SQL injection prevention, rate limiting, HTTPS)
8. **GitHub Actions workflow passes all checks** (lint, test, coverage, audit)
9. **API Documentation implemented** (Hapi-Swagger with OpenAPI 3.0)
10. Documentation is complete and accurate

### 9.2. Production Readiness

For production deployment, the following are required:

**Infrastructure:**

- ✅ Nginx configured with rate limiting and SSL/TLS
- ✅ HTTPS enforced with valid SSL certificate (Let's Encrypt)
- ✅ PostgreSQL database with proper backup strategy
- ✅ Environment variables configured for production
- ✅ CI/CD pipeline with automated deployment

**Monitoring & Operations:**

- Load testing performed (1000 req/s sustained)
- Monitoring and logging configured
- Health check endpoint monitored (`/health`)
- Error tracking system integrated (e.g., Sentry)
- Database connection pool monitoring
- API documentation published (Swagger/OpenAPI - optional)

---

## 10. Assumptions & Constraints

### 10.1. Assumptions

- Users have stable internet connection
- Frontend handles UI/UX for soft-deleted content display
- Users cannot edit threads, comments, or replies after creation
- No file upload functionality (text content only)
- Single language support (Indonesian for error messages)
- Database and API server are in the same network (low latency)

### 10.2. Known Limitations

- No email verification on registration
- No password reset/forgot password functionality
- No user profile management (update fullname, password)
- No admin/moderator features
- No content moderation tools
- No search functionality
- No pagination on thread list (future enhancement)
- No real-time notifications
- Soft delete data accumulates (no automated cleanup)

### 10.3. Out of Scope

The following features are explicitly **not included** in this version:

- Email notifications
- Push notifications
- Thread categories or tags
- User avatars/profile pictures
- Private messaging
- User blocking/reporting
- Content flagging system
- Thread voting/ranking
- User reputation system
- OAuth/social login

---

## 11. CI/CD Implementation

### 11.1. GitHub Actions Workflow

The project must implement a comprehensive CI/CD pipeline using GitHub Actions. The workflow file should be located at `.github/workflows/ci.yml`.

#### Workflow Configuration

**Triggers:**

- On push to any branch
- On pull request to `master` or `development` branches
- Manual trigger via `workflow_dispatch`

**Required Jobs:**

##### 1. **Lint Job**

```yaml
- name: Run ESLint
  run: npm run lint
```

- Must complete with zero errors
- Checks code quality and style consistency

##### 2. **Test Job**

```yaml
- name: Run tests
  run: npm test
  env:
    PGHOST_TEST: localhost
    PGUSER_TEST: postgres
    PGPASSWORD_TEST: postgres
    PGDATABASE_TEST: forumapi_test
```

- All tests must pass (170 tests expected)
- Requires PostgreSQL service container
- Test database configured via environment variables

##### 3. **Coverage Job**

```yaml
- name: Check test coverage
  run: npm test -- --coverage
- name: Verify 100% coverage
  run: |
    if [ $(cat coverage/coverage-summary.json | jq '.total.lines.pct') != "100" ]; then
      echo "Coverage below 100%"
      exit 1
    fi
```

- Must achieve 100% code coverage
- Coverage report uploaded as artifact
- Fails if coverage drops below 100%

##### 4. **Security Audit Job**

```yaml
- name: Run npm audit
  run: npm audit --audit-level=high
```

- No high or critical vulnerabilities allowed
- Checks all dependencies for known security issues

#### PostgreSQL Service

The workflow must include a PostgreSQL service for integration tests:

```yaml
services:
  postgres:
    image: postgres:17
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: forumapi_test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

### 11.2. Branch Protection Rules

**Master Branch:**

- Require pull request reviews before merging
- Require status checks to pass before merging:
  - ✅ Lint check
  - ✅ All tests pass
  - ✅ 100% coverage achieved
  - ✅ Security audit clean
- Require branches to be up to date before merging
- Do not allow force pushes

**Development Branch:**

- Same rules as master branch
- Feature branches merge here first

### 11.3. Nginx Configuration for Rate Limiting

Rate limiting must be implemented at the infrastructure level using Nginx as a reverse proxy.

#### Nginx Configuration Example

**File: `/etc/nginx/sites-available/forumapi`**

```nginx
# Define rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=10r/m;

# Define connection limiting
limit_conn_zone $binary_remote_addr zone=addr:10m;

server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate Limiting
    limit_req zone=api_limit burst=20 nodelay;
    limit_conn addr 10;

    # Request size limit
    client_max_body_size 1M;

    location / {
        # Apply general rate limit
        limit_req zone=api_limit burst=20 nodelay;

        # Proxy to Node.js application
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Stricter rate limit for authentication endpoints
    location ~ ^/authentications$ {
        limit_req zone=login_limit burst=5 nodelay;

        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint (no rate limit)
    location /health {
        proxy_pass http://localhost:5000;
        access_log off;
    }

    # Custom error pages
    error_page 429 /429.json;
    location = /429.json {
        internal;
        default_type application/json;
        return 429 '{"status":"fail","message":"Terlalu banyak request. Silakan coba lagi nanti."}';
    }

    error_page 502 503 504 /50x.json;
    location = /50x.json {
        internal;
        default_type application/json;
        return 503 '{"status":"error","message":"Server sedang dalam perbaikan. Silakan coba lagi nanti."}';
    }
}
```

#### Rate Limiting Configuration Explanation

| Directive              | Configuration      | Meaning                                                    |
| ---------------------- | ------------------ | ---------------------------------------------------------- |
| `limit_req_zone`       | `rate=100r/m`      | 100 requests per minute per IP address                     |
| `limit_req`            | `burst=20 nodelay` | Allow burst of 20 requests, reject immediately if exceeded |
| `limit_conn_zone`      | `zone=addr:10m`    | 10MB memory to store IP address states                     |
| `limit_conn`           | `addr 10`          | Max 10 concurrent connections per IP                       |
| `client_max_body_size` | `1M`               | Max request body size 1 megabyte                           |

**Special Rate Limits:**

- **Login endpoint**: 10 requests/minute (stricter to prevent brute force)
- **Health check**: No rate limit (for monitoring)
- **General API**: 100 requests/minute with burst of 20

### 11.4. SQL Injection Prevention

SQL injection prevention is **mandatory** and must be verified during code review.

#### Required Practices

**✅ CORRECT - Use Parameterized Queries:**

```javascript
// Repository method example
async verifyAvailableUsername(username) {
  const query = {
    text: 'SELECT username FROM users WHERE username = $1',
    values: [username],
  };

  const result = await this._pool.query(query);
  return result.rowCount;
}

async addThread({ title, body, owner }) {
  const query = {
    text: 'INSERT INTO threads(id, title, body, owner, date) VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
    values: [id, title, body, owner, date],
  };

  const result = await this._pool.query(query);
  return result.rows[0];
}
```

**❌ INCORRECT - String Concatenation (FORBIDDEN):**

```javascript
// NEVER DO THIS - Vulnerable to SQL injection
async getUserByUsername(username) {
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  // An attacker could input: admin' OR '1'='1
  const result = await this._pool.query(query);
  return result.rows[0];
}
```

#### Verification Checklist

- ✅ All `pool.query()` calls use parameterized queries with `$1, $2, ...` placeholders
- ✅ No string concatenation or template literals in SQL queries
- ✅ User input never directly embedded in query strings
- ✅ Code review specifically checks for SQL injection vulnerabilities
- ✅ Integration tests verify query parameterization

---

## 11.5. API Documentation with Hapi-Swagger

Interactive API documentation must be implemented using `hapi-swagger` to automatically generate OpenAPI 3.0 specification from route definitions.

### Installation

```bash
npm install --save hapi-swagger @hapi/inert @hapi/vision joi
```

**Dependencies:**

- `hapi-swagger`: Generates Swagger documentation
- `@hapi/inert`: Serves static files (Swagger UI assets)
- `@hapi/vision`: Template rendering (for Swagger UI)
- `joi`: Schema validation (already used for request validation)

### Server Configuration

Add to `src/Infrastructures/http/createServer.js`:

```javascript
const HapiSwagger = require("hapi-swagger");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const Pack = require("../../../package.json");

const createServer = async (container) => {
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
  });

  // Swagger configuration
  const swaggerOptions = {
    info: {
      title: "Forum API Documentation",
      version: Pack.version,
      description: "Forum API for Garuda Game community",
      contact: {
        name: "API Support",
        email: "support@garudagame.com",
      },
    },
    tags: [
      { name: "users", description: "User registration endpoints" },
      {
        name: "authentications",
        description: "Login, logout, and token refresh",
      },
      { name: "threads", description: "Thread management" },
      { name: "comments", description: "Comment management" },
      { name: "replies", description: "Reply management (optional)" },
      { name: "likes", description: "Comment likes (optional)" },
    ],
    securityDefinitions: {
      jwt: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
        description: "JWT token in format: Bearer {token}",
      },
    },
    security: [{ jwt: [] }],
    grouping: "tags",
    sortTags: "name",
    sortEndpoints: "ordered",
  };

  // Register Swagger before routes
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);

  // Register JWT and routes...
  await server.register(require("@hapi/jwt"));
  // ... rest of server configuration
};
```

### Route Documentation

Update routes to include Joi validation and Swagger documentation:

**Example - POST /threads:**

```javascript
const Joi = require("joi");

const routes = (handler) => [
  {
    method: "POST",
    path: "/threads",
    handler: handler.postThreadHandler,
    options: {
      auth: "forumapi_jwt",
      tags: ["api", "threads"],
      description: "Create a new thread",
      notes: "Requires authentication. Creates a new discussion thread.",
      validate: {
        payload: Joi.object({
          title: Joi.string()
            .min(1)
            .max(50)
            .required()
            .description("Thread title")
            .example("How to win in Game X?"),
          body: Joi.string()
            .min(1)
            .max(10000)
            .required()
            .description("Thread content")
            .example("I need tips for winning in level 10..."),
        }),
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            201: {
              description: "Thread created successfully",
              schema: Joi.object({
                status: Joi.string().example("success"),
                data: Joi.object({
                  addedThread: Joi.object({
                    id: Joi.string().example("thread-h_W1Plfpj0TY7wyT2PUPX"),
                    title: Joi.string().example("How to win in Game X?"),
                    owner: Joi.string().example("user-DWrT3pXe1hccYkV1eIAxS"),
                  }),
                }),
              }),
            },
            400: {
              description: "Bad Request - Invalid payload",
              schema: Joi.object({
                status: Joi.string().example("fail"),
                message: Joi.string().example(
                  "tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada"
                ),
              }),
            },
            401: {
              description: "Unauthorized - Missing or invalid token",
              schema: Joi.object({
                status: Joi.string().example("fail"),
                message: Joi.string().example("Missing authentication"),
              }),
            },
          },
        },
      },
    },
  },
];
```

**Example - GET /threads/{threadId}:**

```javascript
{
  method: 'GET',
  path: '/threads/{threadId}',
  handler: handler.getThreadByIdHandler,
  options: {
    tags: ['api', 'threads'],
    description: 'Get thread details with comments and replies',
    notes: 'Returns complete thread information including all comments and replies. Deleted content is masked.',
    validate: {
      params: Joi.object({
        threadId: Joi.string().required()
          .description('Thread ID')
          .example('thread-h_2FkLZhtgBKY2kh4CC02')
      })
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          200: {
            description: 'Thread retrieved successfully',
            schema: Joi.object({
              status: Joi.string().example('success'),
              data: Joi.object({
                thread: Joi.object({
                  id: Joi.string(),
                  title: Joi.string(),
                  body: Joi.string(),
                  date: Joi.string().isoDate(),
                  username: Joi.string(),
                  comments: Joi.array().items(
                    Joi.object({
                      id: Joi.string(),
                      username: Joi.string(),
                      date: Joi.string().isoDate(),
                      content: Joi.string(),
                      likeCount: Joi.number().integer().optional(),
                      replies: Joi.array().items(
                        Joi.object({
                          id: Joi.string(),
                          content: Joi.string(),
                          date: Joi.string().isoDate(),
                          username: Joi.string()
                        })
                      ).optional()
                    })
                  )
                })
              })
            })
          },
          404: {
            description: 'Thread not found',
            schema: Joi.object({
              status: Joi.string().example('fail'),
              message: Joi.string().example('Thread tidak ditemukan')
            })
          }
        }
      }
    }
  }
}
```

### Documentation Endpoints

After implementation, the following endpoints will be available:

- **`GET /documentation`**: Interactive Swagger UI
- **`GET /swagger.json`**: OpenAPI 3.0 JSON specification

### Documentation Requirements Checklist

- ✅ All endpoints have `tags` for grouping
- ✅ All endpoints have `description` and `notes`
- ✅ Request payloads validated with Joi schemas
- ✅ Path parameters and query strings documented
- ✅ Response schemas defined for all status codes (200, 201, 400, 401, 403, 404, 500)
- ✅ Examples provided for request and response bodies
- ✅ Authentication requirements indicated (`auth: 'forumapi_jwt'`)
- ✅ Security scheme (JWT) configured in Swagger options
- ✅ API version and contact information included

### Testing Documentation

1. **Start server:**

   ```bash
   npm run start:dev
   ```

2. **Access Swagger UI:**

   ```
   http://localhost:5000/documentation
   ```

3. **Test endpoints:**
   - Use "Try it out" feature in Swagger UI
   - Authenticate with JWT token (click "Authorize" button)
   - Test all endpoints directly from documentation

### Environment Configuration

Add to `.env` if needed:

```bash
# API Documentation (optional)
SWAGGER_HOST=localhost:5000
SWAGGER_SCHEMES=http,https
```

---

## 12. Risk Assessment

### 12.1. Technical Risks

| Risk                                             | Impact   | Probability | Mitigation                                                             |
| ------------------------------------------------ | -------- | ----------- | ---------------------------------------------------------------------- |
| Database performance degradation with large data | High     | Medium      | Add database indexes on foreign keys and date columns                  |
| JWT secret key exposure                          | Critical | Low         | Store in environment variables, never commit to repo, rotate regularly |
| SQL injection vulnerability                      | Critical | Low         | Use parameterized queries only, enforce in code review                 |
| Rate limit bypass                                | Medium   | Medium      | Implement at Nginx level + monitor for unusual patterns                |
| CI/CD pipeline failure                           | Medium   | Low         | Maintain backup deployment method, test workflow regularly             |
| Memory leak from connection pool                 | Medium   | Low         | Implement proper connection pool management, monitor memory usage      |
| Soft delete data bloat                           | Medium   | High        | Document cleanup strategy for future implementation                    |
| Bcrypt performance impact                        | Low      | Medium      | Use appropriate salt rounds (10), consider caching for high-traffic    |

### 11.2. Project Risks

| Risk                              | Impact | Probability | Mitigation                                                |
| --------------------------------- | ------ | ----------- | --------------------------------------------------------- |
| Scope creep                       | Medium | High        | Strict adherence to PRD, reject non-critical features     |
| Testing time underestimation      | Medium | Medium      | Start testing early, write tests alongside implementation |
| Clean Architecture learning curve | Low    | Medium      | Code reviews, pair programming, reference documentation   |
| Database migration failures       | Medium | Low         | Test migrations on staging, maintain rollback scripts     |

---

## 12. Glossary

- **Clean Architecture**: Software design pattern that separates concerns into layers (Entities, Use Cases, Interface Adapters, Frameworks)
- **Soft Delete**: Marking a record as deleted (e.g., `is_delete = true`) without physically removing it from the database
- **JWT (JSON Web Token)**: Compact, URL-safe means of representing claims between two parties
- **Access Token**: Short-lived token used to authenticate API requests (1 hour)
- **Refresh Token**: Long-lived token used to obtain new access tokens (7 days)
- **Bcrypt**: Password hashing function designed to be slow to resist brute-force attacks
- **Salt Rounds**: Number of iterations bcrypt uses (10 = 2^10 = 1024 iterations)
- **nanoid**: Unique string ID generator (alternative to UUID)
- **P95 Response Time**: 95th percentile response time (95% of requests are faster than this)
- **Integration Test**: Test that verifies interaction between multiple components (e.g., repository + database)
- **Unit Test**: Test that verifies a single component in isolation (with mocked dependencies)
