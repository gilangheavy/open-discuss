const AddThread = require("../../../Domains/threads/entities/AddThread");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const Thread = require("../../../Domains/threads/entities/Thread");
const ThreadUseCase = require("../ThreadUseCase");

describe("AddThreadUseCase", () => {
  it("should orchestrating the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "title",
      body: "body",
    };

    const owner = "user-123";

    const mockAddedThread = new AddedThread({
      id: "thread-123",
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
        id: "thread-123",
        title: useCasePayload.title,
        owner,
      })
    );
    expect(mockThreadRepository.addThread).toBeCalledWith(
      new AddThread(useCasePayload),
      owner
    );
  });
});

describe("GetThreadUseCase", () => {
  it("should orchestrating the get thread action correctly", async () => {
    // Arrange
    const threadId = "thread-123";
    const mockThread = new Thread({
      id: "thread-123",
      title: "title",
      body: "body",
      date: new Date(),
      username: "dicoding",
      comments: [],
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const thread = await threadUseCase.getThread(threadId);

    // Assert
    expect(thread).toStrictEqual(mockThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
  });
});
