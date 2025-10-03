const AddReply = require("../../Domains/replies/entities/AddReply");

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload, threadId, commentId, owner) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);
    const addReply = new AddReply({ ...useCasePayload, commentId, owner });
    return this._replyRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;
