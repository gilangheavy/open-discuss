/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
const AddThread = require('../../Domains/threads/entities/AddThread');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');
const Thread = require('../../Domains/threads/entities/Thread');

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
      throw new NotFoundError(DomainErrorTranslator.translate(new Error('THREAD.NOT_FOUND')));
    }
    const threadEntity = new Thread({
      ...thread,
      comments: [],
    });

    return threadEntity;
  }
}

module.exports = ThreadUseCase;
