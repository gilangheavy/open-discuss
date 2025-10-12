const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const Thread = require('../../../Domains/threads/entities/Thread');
const ThreadUseCase = require('../ThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
    };

    const owner = 'user-123';

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await threadUseCase.addThread(useCasePayload, owner);

    // Assert
    expect(addedThread).toStrictEqual(
      new AddedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner,
      }),
    );
    expect(mockThreadRepository.addThread).toBeCalledWith(
      new AddThread(useCasePayload),
      owner,
    );
  });
});

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const rawThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date(),
      username: 'dicoding',
      // repository returns raw row -> no comments field here
    };

    const mockThreadRepository = new ThreadRepository();
    // mock returns raw object (not new Thread instance)
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(rawThread);

    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const thread = await threadUseCase.getThread(threadId);

    // Assert: expected is a Domain Thread created from the raw data
    expect(thread).toStrictEqual(new Thread({ ...rawThread, comments: [] }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
  });

  it('should throw NotFoundError when thread is not found', async () => {
    // Arrange
    const threadId = 'thread-not-exist';
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(null);
    const threadUseCase = new ThreadUseCase({ threadRepository: mockThreadRepository });

    // Action & Assert
    await expect(threadUseCase.getThread(threadId)).rejects.toThrowError('thread tidak ditemukan');
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
  });
});
