/* eslint-disable no-underscore-dangle */
const AddReply = require('../../Domains/replies/entities/AddReply');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');

class ReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async addReply(useCasePayload, threadId, commentId, owner) {
    const threadCount = await this._threadRepository.verifyThreadAvailability(threadId);
    if (!threadCount) {
      throw DomainErrorTranslator.translate(new Error('THREAD.NOT_FOUND'));
    }
    const commentCount = await this._commentRepository.verifyCommentAvailability(commentId);
    if (!commentCount) {
      throw DomainErrorTranslator.translate(new Error('COMMENT.NOT_FOUND'));
    }
    const addReply = new AddReply({ ...useCasePayload, commentId, owner });
    return this._replyRepository.addReply(addReply);
  }

  async deleteReply(threadId, commentId, replyId, owner) {
    const threadCount = await this._threadRepository.verifyThreadAvailability(threadId);
    if (!threadCount) {
      throw DomainErrorTranslator.translate(new Error('THREAD.NOT_FOUND'));
    }
    const commentCount = await this._commentRepository.verifyCommentAvailability(commentId);
    if (!commentCount) {
      throw DomainErrorTranslator.translate(new Error('COMMENT.NOT_FOUND'));
    }
    const replyExists = await this._replyRepository.verifyReplyAvailability(replyId);
    if (!replyExists) {
      throw DomainErrorTranslator.translate(new Error('REPLY.NOT_FOUND'));
    }
    const reply = await this._replyRepository.verifyReplyOwner(replyId);
    if (!reply) {
      throw DomainErrorTranslator.translate(new Error('REPLY.NOT_FOUND'));
    }
    if (reply.owner !== owner) {
      throw DomainErrorTranslator.translate(new Error('REPLY.ACCESS_DENIED'));
    }
    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = ReplyUseCase;
