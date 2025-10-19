/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */

/**
 * LikeRepository
 * Abstract repository for comment like operations
 * Defines contract for like/unlike functionality
 */
class LikeRepository {
  /**
   * Add a like to a comment
   * Must be implemented by concrete repository
   *
   * @param {string} commentId - ID of the comment to like
   * @param {string} userId - ID of the user who likes
   * @returns {Promise<void>}
   * @throws {Error} If not implemented
   */
  async addLike(commentId, userId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  /**
   * Remove a like from a comment
   * Must be implemented by concrete repository
   *
   * @param {string} commentId - ID of the comment to unlike
   * @param {string} userId - ID of the user who unlikes
   * @returns {Promise<void>}
   * @throws {Error} If not implemented
   */
  async removeLike(commentId, userId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  /**
   * Check if user has already liked a comment
   * Must be implemented by concrete repository
   *
   * @param {string} commentId - ID of the comment to check
   * @param {string} userId - ID of the user to check
   * @returns {Promise<boolean>} True if user has liked, false otherwise
   * @throws {Error} If not implemented
   */
  async hasUserLikedComment(commentId, userId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  /**
   * Get total like count for a comment
   * Must be implemented by concrete repository
   *
   * @param {string} commentId - ID of the comment
   * @returns {Promise<number>} Total number of likes
   * @throws {Error} If not implemented
   */
  async getLikeCount(commentId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = LikeRepository;
