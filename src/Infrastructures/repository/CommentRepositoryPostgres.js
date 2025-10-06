const CommentRepository = require("../../Domains/comments/CommentRepository");
const AddedComment = require("../../Domains/comments/entities/AddedComment");
// Repository should not implement business logic or throw domain errors

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
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

  async verifyCommentOwner(commentId) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
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
        "SELECT comments.id, users.username, comments.date, comments.content, comments.is_delete " +
        "FROM comments LEFT JOIN users ON comments.owner = users.id " +
        "WHERE comments.thread_id = $1 ORDER BY comments.date ASC",
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      ...row,
      date: new Date(row.date).toISOString(),
    }));
  }

  async verifyCommentAvailability(commentId) {
    const query = {
      text: "SELECT 1 FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rowCount;
  }
}

module.exports = CommentRepositoryPostgres;
