const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const DeleteCommentUseCase = require("../DeleteCommentUseCase");

describe("DeleteCommentUseCase", () => {
  it("should orchestrating the delete comment action correctly", async () => {
    // Arrange
    const threadId = "thread-123";
    const commentId = "comment-123";
    const owner = "user-123";

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyCommentAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.deleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(threadId, commentId, owner);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(
      threadId
    );
    expect(mockThreadRepository.verifyCommentAvailability).toBeCalledWith(
      commentId
    );
    expect(mockThreadRepository.verifyCommentOwner).toBeCalledWith(
      commentId,
      owner
    );
    expect(mockThreadRepository.deleteComment).toBeCalledWith(commentId);
  });
});
