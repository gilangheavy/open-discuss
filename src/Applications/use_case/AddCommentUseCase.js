const AddComment = require("../../Domains/comments/entities/AddComment");

class AddCommentUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, threadId, owner) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    const addComment = new AddComment({ ...useCasePayload, threadId, owner });
    return this._threadRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
