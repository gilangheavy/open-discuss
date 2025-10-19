/* eslint-disable no-underscore-dangle */
/**
 * LikeUseCase
 * Use case for toggling comment likes (like/unlike)
 * Implements business logic for like functionality
 */
class LikeUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  /**
   * Toggle like on a comment
   * If user has already liked, remove the like (unlike)
   * If user has not liked, add a like
   *
   * @param {string} threadId - ID of the thread
   * @param {string} commentId - ID of the comment to like/unlike
   * @param {string} userId - ID of the user performing the action
   * @returns {Promise<void>}
   * @throws {NotFoundError} If thread or comment not found
   */
  async execute(threadId, commentId, userId) {
    // Verify thread exists
    const threadExists = await this._threadRepository.verifyThreadAvailability(threadId);
    if (threadExists === 0) {
      throw new Error('THREAD.NOT_FOUND');
    }

    // Verify comment exists and belongs to thread
    const commentAvailable = await this._commentRepository
      .verifyCommentAvailability(commentId);
    if (commentAvailable === 0) {
      throw new Error('COMMENT.NOT_FOUND');
    }

    // Check if user has already liked the comment
    const hasLiked = await this._likeRepository.hasUserLikedComment(commentId, userId);

    if (hasLiked) {
      // User has already liked, so unlike (remove like)
      await this._likeRepository.removeLike(commentId, userId);
    } else {
      // User has not liked, so like (add like)
      await this._likeRepository.addLike(commentId, userId);
    }
  }
}

module.exports = LikeUseCase;
