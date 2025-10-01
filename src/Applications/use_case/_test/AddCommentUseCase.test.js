const AddComment = require("../../../Domains/threads/entities/AddComment");
const AddedComment = require("../../../Domains/threads/entities/AddedComment");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddCommentUseCase = require("../AddCommentUseCase");

describe("AddCommentUseCase", () => {
  it("should orchestrating the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "sebuah comment",
    };
    const threadId = "thread-123";
    const owner = "user-123";

    const mockAddedComment = new AddedComment({
      id: "comment-123",
      content: useCasePayload.content,
      owner,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(
      useCasePayload,
      threadId,
      owner
    );

    // Assert
    expect(addedComment).toStrictEqual(
      new AddedComment({
        id: "comment-123",
        content: useCasePayload.content,
        owner,
      })
    );
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(
      threadId
    );
    expect(mockThreadRepository.addComment).toBeCalledWith(
      new AddComment({
        content: useCasePayload.content,
        threadId,
        owner,
      })
    );
  });
});
