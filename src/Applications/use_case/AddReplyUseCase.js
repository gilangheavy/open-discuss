const AddReply = require("../../Domains/replies/entities/AddReply");

class AddReplyUseCase {
  constructor({ threadRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload, threadId, commentId, owner) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._threadRepository.verifyCommentAvailability(commentId);
    const addReply = new AddReply({ ...useCasePayload, commentId, owner });
    return this._replyRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;
