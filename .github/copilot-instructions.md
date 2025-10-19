# Copilot instructions for Forum API

Use these project-specific rules to be productive immediately. Stick to the existing layering and patterns; prefer concrete examples below.

## Architecture at a glance

- Layers (do not cross boundaries directly):
  - Domains: entities and abstract repositories, plus domain errors (`src/Domains/**`, `src/Commons/exceptions/**`).
  - Applications: use cases orchestrating domain rules (`src/Applications/use_case/**`).
  - Infrastructures: adapters (Postgres repos, security, Hapi server, DI container) (`src/Infrastructures/**`).
  - Interfaces: HTTP route plugins and handlers (`src/Interfaces/http/api/**`).
- Dependency Injection via `instances-container` in `src/Infrastructures/container.js`. Use `Class.name` as the DI key and resolve with `container.getInstance(Name)`. Register new repos and use cases here.

## HTTP server and auth

- Hapi server configured in `src/Infrastructures/http/createServer.js`.
- JWT strategy id: `forumapi_jwt`; payload user id is exposed as `request.auth.credentials.id`.
- Plugin structure per feature: `index.js` (register), `routes.js` (paths, auth), `handler.js` (Hapi handlers). See `src/Interfaces/http/api/threads/**` for examples.

## Errors and mapping

- Business errors are domain-specific and localized (Indonesian). Central translation: `src/Commons/exceptions/DomainErrorTranslator.js`.
- `onPreResponse` maps:
  - `ClientError` -> `{ status: 'fail', message }` with 4xx.
  - Other non-server errors -> default Hapi handling.
  - Server errors -> `{ status: 'error', message: 'terjadi kegagalan pada server kami' }` (500).
- When adding new validation/authorization rules, add a key to the translator and throw domain errors from use cases, not repositories.

## Repository contracts and conventions

- Repositories only access data; they do not enforce business rules.
  - Return counts/rows for existence/ownership checks; let use cases decide errors.
  - Example: `CommentRepositoryPostgres.verifyCommentAvailability(id)` returns `rowCount` (number); `verifyCommentOwner(id)` returns the row; use case checks owner and throws `AuthorizationError`.
- IDs use nanoid prefixed strings (e.g., `comment-${id}`) in Postgres repos.
- Soft delete via `is_delete` flag; handlers mask content when returning API responses.

## Thread detail composition (important pattern)

- `ThreadsHandler.getThreadByIdHandler` composes the response by:
  1. `ThreadUseCase.getThread(threadId)` -> base thread.
  2. `CommentRepository.getCommentsByThreadId(threadId)` -> comments.
  3. `ReplyRepository.getRepliesByCommentId(comment.id)` per comment -> replies.
  4. Mask deleted content: `**komentar telah dihapus**` and `**balasan telah dihapus**`.
  5. Sort comments by date asc; ensure thread `date` is an ISO string.

## Typical flow examples

- Add comment: HTTP handler -> `CommentUseCase.addComment(payload, threadId, owner)` -> repo `addComment` returns `AddedComment` -> HTTP 201 with `{ status: 'success', data: { addedComment } }`.
- Delete reply: HTTP handler -> `ReplyUseCase.deleteReply(threadId, commentId, replyId, owner)` -> repo sets `is_delete = true` -> HTTP 200 `{ status: 'success' }`.

## Developer workflows

- Environment: `.env` required (keys in README). Tests use `PG*_TEST` and `config/database/test.json`.
- Migrations: `npm run migrate` (dev) / `npm run migrate:test` (test). Ensure migrations run before server/tests.
- Run server: `npm run start:dev` (nodemon) or `npm run start`.
- Tests: `npm test` (Jest, loads dotenv). Integration tests touch DB; helpers under `tests/*TableTestHelper.js`.

## Adding a new feature (checklist)

- Domain: add entity/abstract repository methods and domain error keys where needed.
- Infra: implement Postgres repository with raw queries only; register in `container.js` with correct dependencies (`pool`, `nanoid`).
- Use case: orchestrate repositories, enforce rules, throw translated domain errors.
- HTTP: add plugin folder with `routes.js` and `handler.js`; register plugin in `createServer.js` if new top-level feature.
- Tests: repository (integration), use case (mock repos), HTTP (via `createServer(container)`), following existing patterns and messages.

## Reference files

- DI container: `src/Infrastructures/container.js`
- Server and error mapping: `src/Infrastructures/http/createServer.js`
- Threads HTTP example: `src/Interfaces/http/api/threads/{routes.js,handler.js}`
- Repos: `src/Infrastructures/repository/*RepositoryPostgres.js`
- Use cases: `src/Applications/use_case/*.js`
- Domain errors: `src/Commons/exceptions/*.js`
