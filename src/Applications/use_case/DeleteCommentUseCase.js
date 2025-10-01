class DeleteCommentUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, owner) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._threadRepository.verifyCommentAvailability(commentId);
    await this._threadRepository.verifyCommentOwner(commentId, owner);
    await this._threadRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
