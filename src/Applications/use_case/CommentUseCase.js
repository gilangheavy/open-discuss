const AddComment = require("../../Domains/comments/entities/AddComment");

class CommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async addComment(useCasePayload, threadId, owner) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    const addComment = new AddComment({ ...useCasePayload, threadId, owner });
    return this._commentRepository.addComment(addComment);
  }

  async deleteComment(threadId, commentId, owner) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = CommentUseCase;
