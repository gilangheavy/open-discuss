/* eslint-disable no-underscore-dangle */
const AddComment = require('../../Domains/comments/entities/AddComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');

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
      throw new NotFoundError(DomainErrorTranslator.translate(new Error('THREAD.NOT_FOUND')));
    }
    const addComment = new AddComment({ ...useCasePayload, threadId, owner });
    return this._commentRepository.addComment(addComment);
  }

  async deleteComment(threadId, commentId, owner) {
    const threadCount = await this._threadRepository.verifyThreadAvailability(
      threadId,
    );
    if (!threadCount) {
      throw new NotFoundError(DomainErrorTranslator.translate(new Error('THREAD.NOT_FOUND')));
    }
    const commentCount = await this._commentRepository.verifyCommentAvailability(commentId);
    if (!commentCount) {
      throw new NotFoundError(DomainErrorTranslator.translate(new Error('COMMENT.NOT_FOUND')));
    }
    const comment = await this._commentRepository.verifyCommentOwner(
      commentId,
      owner,
    );
    if (!comment) {
      throw new NotFoundError(DomainErrorTranslator.translate(new Error('COMMENT.NOT_FOUND')));
    }
    if (comment.owner !== owner) {
      throw new AuthorizationError(DomainErrorTranslator.translate(new Error('USER.ACCESS_DENIED')));
    }
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = CommentUseCase;
