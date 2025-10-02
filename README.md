# Open Discuss — Forum API

Backend API built with Hapi, PostgreSQL, and JWT authentication. Includes users, authentications, threads, comments, and replies.

## Prerequisites

- Node.js 14+ (LTS recommended)
- PostgreSQL 12+

## Environment variables

Create a `.env` file in the project root with at least the following variables (values are examples):

```
# Server
HOST=localhost
PORT=4000

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
npm start
```

The API will listen on `http://HOST:PORT` (default `http://localhost:4000`).

## Run tests

```
npm test
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

Import `Forum API V1 Test.postman_collection.json` to run end-to-end requests. Set the following variables in your Postman environment: `protocol` (http), `host` (localhost), `port` (4000), and data like `newUsername`, `newPassword`, etc. The collection includes tests for success and error paths.

## Troubleshooting

- 500 on POST /threads or other endpoints: ensure DB migrations have been applied (`npm run migrate`) and your JWT keys match those used to sign tokens.
- Unauthorized (401): include `Authorization: Bearer <accessToken>` header for protected endpoints.
