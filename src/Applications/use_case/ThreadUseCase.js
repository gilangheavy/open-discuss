/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
const AddThread = require('../../Domains/threads/entities/AddThread');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');

class ThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async addThread(useCasePayload, owner) {
    const addThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(addThread, owner);
  }

  async getThread(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    if (!thread) {
      throw DomainErrorTranslator.translate(new Error('THREAD.NOT_FOUND'));
    }
    const commentsRaw = await this._commentRepository.getCommentsByThreadId(
      threadId,
    );
    const comments = await Promise.all(
      commentsRaw.map(async (comment) => {
        const repliesRaw = await this._replyRepository.getRepliesByCommentId(
          comment.id,
        );
        const replies = repliesRaw.map((reply) => ({
          id: reply.id,
          content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
          date:
            reply.date instanceof Date ? reply.date.toISOString() : reply.date,
          username: reply.username,
        }));

        return {
          id: comment.id,
          username: comment.username,
          date:
            comment.date instanceof Date
              ? comment.date.toISOString()
              : comment.date,
          content: comment.is_delete
            ? '**komentar telah dihapus**'
            : comment.content,
          replies,
        };
      }),
    );
    comments.sort((a, b) => new Date(a.date) - new Date(b.date));
    const threadView = {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date instanceof Date ? thread.date.toISOString() : thread.date,
      username: thread.username,
      comments,
    };

    return threadView;
  }
}

module.exports = ThreadUseCase;
