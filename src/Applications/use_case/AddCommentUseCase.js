const AddComment = require("../../Domains/comments/entities/AddComment");

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, threadId, owner) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    const addComment = new AddComment({ ...useCasePayload, threadId, owner });
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
