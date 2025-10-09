/* eslint-disable no-underscore-dangle */
const AddComment = require('../../Domains/comments/entities/AddComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async addComment(useCasePayload, threadId, owner) {
    const threadCount = await this._threadRepository.verifyThreadAvailability(
      threadId,
    );
    if (!threadCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
    const addComment = new AddComment({ ...useCasePayload, threadId, owner });
    return this._commentRepository.addComment(addComment);
  }

  async deleteComment(threadId, commentId, owner) {
    const threadCount = await this._threadRepository.verifyThreadAvailability(
      threadId,
    );
    if (!threadCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
    const commentCount = await this._commentRepository.verifyCommentAvailability(commentId);
    if (!commentCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
    const comment = await this._commentRepository.verifyCommentOwner(
      commentId,
      owner,
    );
    if (!comment) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
    if (comment.owner !== owner) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = CommentUseCase;
