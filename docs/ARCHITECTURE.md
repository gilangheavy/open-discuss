# Architecture Overview: Forum API

## 1. High-Level Goal

The Forum API is the back-end for a community discussion forum. It is designed to be scalable, maintainable, and testable, providing a robust foundation for web and mobile client applications.

## 2. Core Architectural Pattern: Clean Architecture

This project is built following the principles of **Clean Architecture**. This pattern separates the software into layers, with a strict rule that dependencies can only point inwards. This means that inner layers are independent of outer layers, making the core business logic (Domains) independent of infrastructure details like the database or web framework.

The primary layers in this project are:

1.  **Domains**: The innermost layer, containing the core business logic and data structures.
2.  **Applications**: The use case layer, which orchestrates the flow of data between the Domains and the outer layers.
3.  **Interfaces**: The presentation layer, which adapts external interfaces (like an HTTP API) to the application's use cases.
4.  **Infrastructures**: The outermost layer, which contains all the concrete implementations of external concerns like the database, web server, and third-party libraries.

![Clean Architecture Diagram](https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg)
_Image credit: Robert C. Martin (Uncle Bob)_

---

## 3. Layer Breakdown

### `src/Domains`

This is the heart of the application. It has no dependencies on any other layer in the project.

- **Entities** (e.g., `Domains/users/entities/RegisterUser.js`): These are the core business objects. They contain data validation and business rules that are always true for that entity. For example, `RegisterUser` ensures that the payload for a new user has the correct properties and data types.
- **Abstract Repositories** (e.g., `Domains/users/UserRepository.js`): These define the contracts (interfaces) for how the application accesses data, without specifying _how_ that data is stored. For example, `UserRepository` defines methods like `addUser` and `verifyAvailableUsername`, which must be implemented by an outer layer.

### `src/Applications`

This layer contains the application-specific business rules and orchestrates the use cases.

- **Use Cases** (e.g., `Applications/use_case/AddUserUseCase.js`): Each use case represents a single action the system can perform. It executes the business logic, using the domain entities and abstract repositories to do its work. For example, `AddUserUseCase` coordinates the process of checking if a username is available, hashing the password, and saving the new user.
- **Security Abstractions** (e.g., `Applications/security/PasswordHash.js`): Similar to repository abstractions, this layer defines contracts for infrastructure concerns like password hashing or token management, allowing the use cases to remain independent of specific implementations.

### `src/Interfaces`

This layer acts as the entry point for external clients, adapting their requests into a format the application can understand.

- **API Handlers** (e.g., `Interfaces/http/api/users/handler.js`): These handlers are specific to the web framework (Hapi.js). They are responsible for:
  1.  Parsing incoming HTTP requests.
  2.  Calling the appropriate use case with the request payload.
  3.  Formatting the data returned by the use case into an HTTP response.
- **Routes** (e.g., `Interfaces/http/api/users/routes.js`): These files define the API endpoints, their paths, methods, and which handler they map to.

### `src/Infrastructures`

This is the outermost layer, containing all the concrete implementations and glue code.

- **Repository Implementations** (e.g., `Infrastructures/repository/UserRepositoryPostgres.js`): This is where the abstract repository interfaces from the `Domains` layer are implemented. `UserRepositoryPostgres` implements the `UserRepository` contract using the `node-postgres` library to interact with a PostgreSQL database.
- **Security Implementations** (e.g., `Infrastructures/security/BcryptPasswordHash.js`): This provides the concrete implementation for the `PasswordHash` interface, using the `bcrypt` library.
- **HTTP Server** (`Infrastructures/http/createServer.js`): This file configures and creates the Hapi.js server instance, registers routes, and sets up authentication strategies and error handling.
- **Database Pool** (`Infrastructures/database/postgres/pool.js`): Manages the connection pool to the PostgreSQL database.
- **Dependency Injection Container** (`Infrastructures/container.js`): This is a crucial file. It uses the `instances-container` library to implement **Dependency Injection**. It registers all the classes and their dependencies, wiring the entire application together. When a use case asks for a `UserRepository`, the container knows to provide a `UserRepositoryPostgres` instance. This makes the application modular and easy to test.

---

## 4. Request Flow Example: Adding a New User

A typical request flows through the layers as follows:

1.  **HTTP Request**: A `POST /users` request is received by the Hapi.js server.
2.  **Interface Layer**: The request is routed to the `postUserHandler` in `Interfaces/http/api/users/handler.js`.
3.  **Get Use Case**: The handler asks the `container` for an instance of `AddUserUseCase`.
4.  **Application Layer**: The handler calls the `execute` method on the `AddUserUseCase` instance, passing the request payload.
5.  **Domain & Application Logic**:
    - The use case creates a `RegisterUser` entity (from the `Domains` layer) to validate the data.
    - The use case calls `this._userRepository.verifyAvailableUsername()`. The container injects `UserRepositoryPostgres`, which runs a `SELECT` query.
    - The use case calls `this._passwordHash.hash()`. The container injects `BcryptPasswordHash`, which hashes the password with `bcrypt`.
    - The use case calls `this._userRepository.addUser()`.
6.  **Infrastructure Layer**: `UserRepositoryPostgres` executes an `INSERT` statement into the PostgreSQL database.
7.  **Response Flow**: The result (the newly registered user) is returned back up through the layers.
8.  **HTTP Response**: The `UsersHandler` receives the result, wraps it in a standard response format, and sends a `201 Created` response to the client.

This architecture ensures that the core business logic is decoupled from the web framework and database, making the system flexible and easy to maintain.
