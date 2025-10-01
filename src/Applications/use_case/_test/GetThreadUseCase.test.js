const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const Thread = require("../../../Domains/threads/entities/Thread");
const GetThreadUseCase = require("../GetThreadUseCase");

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

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(threadId);

    // Assert
    expect(thread).toStrictEqual(mockThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
  });
});
