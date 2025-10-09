/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    threadId = 'thread-123',
    content = 'sebuah comment',
    owner = 'user-123',
    isDelete = false,
    date = '2023-01-01T00:00:00.000Z',
  }) {
    const query = {
      text: 'INSERT INTO comments (id, thread_id, content, owner, is_delete, date) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, threadId, content, owner, isDelete, date],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
