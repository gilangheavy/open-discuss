const AddThread = require("../../Domains/threads/entities/AddThread");

class ThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async addThread(useCasePayload, owner) {
    const addThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(addThread, owner);
  }

  async getThread(threadId) {
    return this._threadRepository.getThreadById(threadId);
  }
}

module.exports = ThreadUseCase;
