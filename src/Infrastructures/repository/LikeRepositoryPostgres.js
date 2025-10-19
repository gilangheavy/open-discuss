/* eslint-disable no-underscore-dangle */
const LikeRepository = require('../../Domains/likes/LikeRepository');

/**
 * LikeRepositoryPostgres
 * Concrete implementation of LikeRepository using PostgreSQL
 * Handles like/unlike operations for comments
 */
class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  /**
   * Add a like to a comment
   * Creates a new like record in comment_likes table
   *
   * @param {string} commentId - ID of the comment to like
   * @param {string} userId - ID of the user who likes
   * @returns {Promise<void>}
   */
  async addLike(commentId, userId) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comment_likes(id, comment_id, user_id) VALUES($1, $2, $3)',
      values: [id, commentId, userId],
    };

    await this._pool.query(query);
  }

  /**
   * Remove a like from a comment
   * Deletes the like record from comment_likes table
   *
   * @param {string} commentId - ID of the comment to unlike
   * @param {string} userId - ID of the user who unlikes
   * @returns {Promise<void>}
   */
  async removeLike(commentId, userId) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  /**
   * Check if user has already liked a comment
   * Queries comment_likes table for existing like
   *
   * @param {string} commentId - ID of the comment to check
   * @param {string} userId - ID of the user to check
   * @returns {Promise<boolean>} True if user has liked, false otherwise
   */
  async hasUserLikedComment(commentId, userId) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  /**
   * Get total like count for a comment
   * Counts all likes for a specific comment
   *
   * @param {string} commentId - ID of the comment
   * @returns {Promise<number>} Total number of likes
   */
  async getLikeCount(commentId) {
    const query = {
      text: 'SELECT COUNT(*)::int as count FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows[0].count;
  }
}

module.exports = LikeRepositoryPostgres;
