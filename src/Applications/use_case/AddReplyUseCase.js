class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(payload, threadId, commentId, owner) {
    // Validasi thread dan comment
    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyAvailableComment(commentId);
    // Buat reply
    const newReply = { ...payload, threadId, commentId, owner };
    return this._replyRepository.addReply(newReply);
  }
}

module.exports = AddReplyUseCase;
