/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'reply content',
    commentId = 'comment-123',
    owner = 'user-123',
    date = new Date().toISOString(),
    isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO replies (id, content, comment_id, owner, date, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, commentId, owner, date, isDelete],
    };
    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies');
  },
};

module.exports = RepliesTableTestHelper;
