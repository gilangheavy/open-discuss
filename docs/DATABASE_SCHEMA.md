# Database Schema

The database schema is defined through migrations and consists of the following tables:

### 1. Users Table

```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  fullname TEXT NOT NULL
);
```

- **id**: Generated using nanoid with prefix `user-`
- **username**: Unique, case-sensitive in storage
- **password**: Bcrypt hash (salt rounds: 10)
- **fullname**: Full name of the user

### 2. Authentications Table

```sql
CREATE TABLE authentications (
  token TEXT NOT NULL
);
```

- **token**: Refresh token (JWT)
- Tokens are added on login and removed on logout

### 3. Threads Table

```sql
CREATE TABLE threads (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  body TEXT NOT NULL,
  owner VARCHAR(50) NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE
);
```

- **id**: Generated using nanoid with prefix `thread-`
- **owner**: Foreign key to users table
- **date**: Auto-generated timestamp

### 4. Comments Table

```sql
CREATE TABLE comments (
  id VARCHAR(50) PRIMARY KEY,
  thread_id VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  owner VARCHAR(50) NOT NULL,
  is_delete BOOLEAN NOT NULL DEFAULT FALSE,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
  FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE
);
```

- **id**: Generated using nanoid with prefix `comment-`
- **is_delete**: Soft delete flag (true = deleted)
- **thread_id**: Foreign key to threads table
- **owner**: Foreign key to users table

### 5. Replies Table (Optional)

```sql
CREATE TABLE replies (
  id VARCHAR(50) PRIMARY KEY,
  comment_id VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  owner VARCHAR(50) NOT NULL,
  is_delete BOOLEAN NOT NULL DEFAULT FALSE,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE
);
```

- **id**: Generated using nanoid with prefix `reply-`
- **is_delete**: Soft delete flag (true = deleted)
- **comment_id**: Foreign key to comments table
- **owner**: Foreign key to users table

### 6. Comment Likes Table (Optional)

```sql
CREATE TABLE comment_likes (
  id VARCHAR(50) PRIMARY KEY,
  comment_id VARCHAR(50) NOT NULL,
  owner VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (comment_id, owner)
);
```

- **id**: Generated using nanoid with prefix `like-`
- **UNIQUE constraint**: Prevents duplicate likes from same user on same comment
- **comment_id**: Foreign key to comments table
- **owner**: Foreign key to users table (the user who liked)

### 7. Database Indexes (Recommended)

For optimal performance, the following indexes should be added:

```sql
CREATE INDEX idx_comments_thread_id ON comments(thread_id);
CREATE INDEX idx_replies_comment_id ON replies(comment_id);
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_threads_date ON threads(date DESC);
CREATE INDEX idx_comments_date ON comments(date ASC);
```
