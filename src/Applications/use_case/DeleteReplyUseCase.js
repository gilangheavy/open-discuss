class DeleteReplyUseCase {
  constructor({ threadRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId, commentId, replyId, owner) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._threadRepository.verifyCommentAvailability(commentId);
    await this._replyRepository.verifyReplyOwner(replyId, owner);
    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
