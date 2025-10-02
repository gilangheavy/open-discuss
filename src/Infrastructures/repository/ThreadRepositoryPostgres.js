const ThreadRepository = require("../../Domains/threads/ThreadRepository");
const AddedThread = require("../../Domains/threads/entities/AddedThread");
const Thread = require("../../Domains/threads/entities/Thread");
const AddedComment = require("../../Domains/threads/entities/AddedComment");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(thread, owner) {
    const { title, body } = thread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: "INSERT INTO threads (id, title, body, owner) VALUES($1, $2, $3, $4) RETURNING id, title, owner",
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async verifyThreadAvailability(threadId) {
    const query = {
      text: "SELECT 1 FROM threads WHERE id = $1",
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("thread tidak ditemukan");
    }
  }

  async getThreadById(threadId) {
    const query = {
      text: "SELECT threads.id, threads.title, threads.body, threads.date, users.username FROM threads JOIN users ON threads.owner = users.id WHERE threads.id = $1",
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("thread tidak ditemukan");
    }

    const thread = result.rows[0];

    // ensure date is a Date object for Thread entity validation
    const threadDate =
      thread.date instanceof Date ? thread.date : new Date(thread.date);

    return new Thread({
      ...thread,
      date: threadDate,
      comments: [], // Will be filled later by comment repository
    });
  }

  async addComment(addComment) {
    const { content, threadId, owner } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO comments (id, thread_id, content, owner, is_delete, date) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner",
      values: [id, threadId, content, owner, false, date],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("komentar tidak ditemukan");
    }

    const comment = result.rows[0];
    if (comment.owner !== owner) {
      throw new AuthorizationError("anda tidak berhak mengakses resource ini");
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: "UPDATE comments SET is_delete = true WHERE id = $1",
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text:
        "SELECT comments.id, users.username, " +
        "to_char(comments.date AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') as date_text, " +
        "comments.content, comments.is_delete " +
        "FROM comments LEFT JOIN users ON comments.owner = users.id " +
        "WHERE comments.thread_id = $1 ORDER BY comments.date ASC",
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      date: row.date_text,
      content: row.content,
      is_delete: row.is_delete,
    }));
  }

  async verifyCommentAvailability(commentId) {
    const query = {
      text: "SELECT 1 FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("komentar tidak ditemukan");
    }
  }
}

module.exports = ThreadRepositoryPostgres;
