# Forum API

Backend API built with Hapi, PostgreSQL, and JWT authentication. Includes users, authentications, threads, comments, and replies.

## Prerequisites

- Node.js 22+ (LTS recommended)
- PostgreSQL 17

## Environment variables

Create a `.env` file in the project root with at least the following variables (values are examples):

```
# Server
HOST=localhost
PORT=5000

# JWT
ACCESS_TOKEN_KEY=supersecretaccesstokenkey
ACCESS_TOKEN_AGE=3600
REFRESH_TOKEN_KEY=supersecretrefreshtokenkey

# Postgres (development)
PGHOST=localhost
PGPORT=5432
PGUSER=developer
PGPASSWORD=supersecretpassword
PGDATABASE=forumapi

# Postgres (tests)
PGHOST_TEST=localhost
PGPORT_TEST=5432
PGUSER_TEST=developer
PGPASSWORD_TEST=supersecretpassword
PGDATABASE_TEST=forumapi_test
```

Also ensure your test DB config matches `config/database/test.json`.

## Install dependencies

```
npm install
```

## Database setup

Create the databases if they don’t exist yet (names should match your env and `config/database/test.json`):

```
createdb forumapi
createdb forumapi_test
```

Run migrations:

```
# Development DB
npm run migrate

# Test DB
npm run migrate:test
```

## Run the server

```
# Dev (with reload)
npm run start:dev

# Production-like
npm run start
```

The API will listen on `http://HOST:PORT` (default `http://localhost:5000`).

## Run tests

```
npm run test
```

Notes:

- Tests connect to the test database using `PG*_TEST` variables.
- Ensure you’ve run `npm run migrate:test` before running tests.

## API overview

- POST /users — register user
- POST /authentications — login (returns accessToken, refreshToken)
- PUT /authentications — refresh access token
- DELETE /authentications — logout (delete refresh token)
- POST /threads — create thread (Bearer access token)
- GET /threads/{threadId} — get thread detail (with comments and replies)
- POST /threads/{threadId}/comments — add comment (Bearer access token)
- DELETE /threads/{threadId}/comments/{commentId} — delete comment (soft delete)
- POST /threads/{threadId}/comments/{commentId}/replies — add reply (Bearer access token)
- DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId} — delete reply (soft delete)

Deleted comments/replies are masked as `**komentar telah dihapus**` and `**balasan telah dihapus**` in the thread detail.

## Postman collection

Import `Forum API V1 Test.postman_collection.json` to run end-to-end requests. Set the following variables in your Postman environment: `protocol` (http), `host` (localhost), `port` (5000), and data like `newUsername`, `newPassword`, etc. The collection includes tests for success and error paths.

## Troubleshooting

- 500 on POST /threads or other endpoints: ensure DB migrations have been applied (`npm run migrate`) and your JWT keys match those used to sign tokens.
- Unauthorized (401): include `Authorization: Bearer <accessToken>` header for protected endpoints.

## Architecture and conventions

This project follows a clean layering approach:

- Domains: entities, abstract repositories, and domain errors
- Applications: use cases (application services) implementing business rules
- Infrastructures: concrete adapters (Postgres repositories, security, HTTP server)
- Interfaces: HTTP handlers and routes

Important decision: avoid business logic in repository layer (hindari penggunaan logic pada layer repository). Repositories should only perform database operations and return raw data, while use cases enforce rules and throw domain errors.

### Repository contracts (cheat sheet)

- AuthenticationRepositoryPostgres
  - checkAvailabilityToken(token) -> number (0 if not found, >0 if exists)
- UserRepositoryPostgres
  - verifyAvailableUsername(username) -> number
  - getPasswordByUsername(username) -> string | undefined
  - getIdByUsername(username) -> string | undefined
- ThreadRepositoryPostgres
  - verifyThreadAvailability(threadId) -> number
  - getThreadById(threadId) -> Thread | undefined
- CommentRepositoryPostgres
  - addComment(addComment) -> AddedComment
  - verifyCommentAvailability(commentId) -> number
  - verifyCommentOwner(commentId, owner) -> row | undefined (owner parameter is ignored here; use case checks authorization)
  - deleteComment(commentId) -> void (soft-delete)
- ReplyRepositoryPostgres
  - addReply(addReply) -> AddedReply
  - verifyReplyOwner(replyId, owner) -> row | undefined (owner parameter is ignored here; use case checks authorization)
  - deleteReply(replyId) -> void (soft-delete)

### Use case responsibilities

Use cases consume repository outputs and enforce business rules, throwing domain errors with localized messages when needed:

- NotFoundError: e.g., "thread tidak ditemukan", "komentar tidak ditemukan", "balasan tidak ditemukan"
- AuthorizationError: "anda tidak berhak mengakses resource ini"
- InvariantError: e.g., "username tidak tersedia", "refresh token tidak ditemukan di database"

### HTTP error mapping

HTTP handlers call use cases; errors bubble to centralized mapping to status codes:

- InvariantError -> 400 Bad Request
- AuthenticationError -> 401 Unauthorized
- AuthorizationError -> 403 Forbidden
- NotFoundError -> 404 Not Found

### Testing guidelines

- Repository integration tests should assert returned counts/rows, not exceptions
- Use case unit tests should mock repositories to return numbers/rows and assert that use cases throw the correct domain errors or return expected entities
- HTTP tests assert status codes/messages produced by domain errors

### Replies table and migrations

The `replies` table is used by tests and runtime. Migrations create it; tests also defensively ensure the table exists. Run `npm run migrate` (or `npm run migrate:test`) before starting or testing.

### Quick start (development)

```
# Install deps
npm install

# Setup databases (ensure .env is filled)
npm run migrate
npm run migrate:test

# Run tests
npm test

# Start dev server
npm run start:dev
```
