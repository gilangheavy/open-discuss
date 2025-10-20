# Forum API

A robust and scalable backend API for a forum application, built with Node.js, Hapi, and PostgreSQL. It provides a clean, layered architecture for managing users, authentication, threads, comments, and replies.

## Features

- User registration and authentication (JWT-based)
- Create, read, update, and delete (CRUD) operations for threads, comments, and replies.
- Like/unlike functionality for comments.
- Soft deletion for comments and replies.
- Detailed thread view with nested comments and replies.
- Comprehensive test suite (unit and integration tests).
- API documentation with OpenAPI (Swagger).

## Technology Stack

- **Backend:** Node.js, Hapi
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Testing:** Jest
- **Linting:** ESLint

## Prerequisites

- Node.js 22+ (LTS recommended)
- PostgreSQL 17

## Getting Started

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/gilangheavy/open-discuss.git
cd open-discuss
npm install
```

### 2. Configuration

Create a `.env` file in the project root by copying the example. This file contains the environment variables for the server, database, and JWT settings.

```bash
cp .env.example .env
```

Update the `.env` file with your local configuration.

### 3. Database Setup

Create the development and test databases:

```bash
createdb forumapi
createdb forumapi_test
```

Run the database migrations:

```bash
# Development DB
npm run migrate

# Test DB
npm run migrate:test
```

### 4. Running the Server

```bash
# Development mode (with auto-reloading)
npm run start:dev

# Production mode
npm run start
```

The API will be available at `http://localhost:5000`.

## API Documentation

This project uses OpenAPI (Swagger) for API documentation. When the server is running, you can access the documentation at `/documentation`.

The OpenAPI specification can be found in `docs/openapi.yaml`.

## API Endpoints

| Method | Endpoint                                                     | Description                                         |
| ------ | ------------------------------------------------------------ | --------------------------------------------------- |
| POST   | `/users`                                                     | Register a new user                                 |
| POST   | `/authentications`                                           | Login to get access and refresh tokens              |
| PUT    | `/authentications`                                           | Refresh the access token                            |
| DELETE | `/authentications`                                           | Logout (delete the refresh token)                   |
| POST   | `/threads`                                                   | Create a new thread (Authentication required)       |
| GET    | `/threads/{threadId}`                                        | Get thread details with comments and replies        |
| POST   | `/threads/{threadId}/comments`                               | Add a comment to a thread (Authentication required) |
| DELETE | `/threads/{threadId}/comments/{commentId}`                   | Delete a comment (soft delete)                      |
| POST   | `/threads/{threadId}/comments/{commentId}/replies`           | Add a reply to a comment (Authentication required)  |
| DELETE | `/threads/{threadId}/comments/{commentId}/replies/{replyId}` | Delete a reply (soft delete)                        |
| PUT    | `/threads/{threadId}/comments/{commentId}/likes`             | Like or unlike a comment (Authentication required)  |

**Note:** Deleted comments and replies are masked with a placeholder text (`**komentar telah dihapus**` and `**balasan telah dihapus**`).

### Testing

Run the test suite with the following command:

```bash
npm run test
```

**Notes:**

- Tests connect to the test database using the `PG*_TEST` environment variables.
- Ensure you have run the migrations for the test database (`npm run migrate:test`) before running the tests.

## Architecture

This project follows a clean architecture with a layered approach:

- **Domains:** Contains the business entities, abstract repositories (interfaces), and domain-specific errors.
- **Applications:** Implements the use cases (application services) that orchestrate the business logic.
- **Infrastructures:** Provides the concrete implementations (adapters) for repositories (PostgreSQL), security, and the HTTP server.
- **Interfaces:** Defines the HTTP handlers and routes that expose the API to the outside world. Handler methods are auto-bound to the class instance.

A key principle in this architecture is to keep the repository layer free of business logic. Repositories are responsible only for database operations, while use cases enforce business rules and throw domain-specific errors.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
