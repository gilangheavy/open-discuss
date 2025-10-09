/* eslint-disable no-underscore-dangle */
const AddReply = require('../../Domains/replies/entities/AddReply');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async addReply(useCasePayload, threadId, commentId, owner) {
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
    const addReply = new AddReply({ ...useCasePayload, commentId, owner });
    return this._replyRepository.addReply(addReply);
  }

  async deleteReply(threadId, commentId, replyId, owner) {
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
    const replyExists = await this._replyRepository.verifyReplyAvailability(replyId);
    if (!replyExists) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
    const reply = await this._replyRepository.verifyReplyOwner(replyId);
    if (!reply) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
    if (reply.owner !== owner) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = ReplyUseCase;
