/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
const AddThread = require('../../Domains/threads/entities/AddThread');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async addThread(useCasePayload, owner) {
    const addThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(addThread, owner);
  }

  async getThread(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    if (!thread) {
      throw new NotFoundError('thread tidak ditemukan');
    }
    return thread;
  }
}

module.exports = ThreadUseCase;
