const ReplyUseCase = require("../ReplyUseCase");
const AddReply = require("../../../Domains/replies/entities/AddReply");

describe("ReplyUseCase", () => {
  let threadRepository;
  let commentRepository;
  let replyRepository;
  let replyUseCase;

  beforeEach(() => {
    threadRepository = {
      verifyThreadAvailability: jest.fn(),
    };
    commentRepository = {
      verifyCommentAvailability: jest.fn(),
    };
    replyRepository = {
      addReply: jest.fn(),
      verifyReplyOwner: jest.fn(),
      deleteReply: jest.fn(),
    };
    replyUseCase = new ReplyUseCase({
      threadRepository,
      commentRepository,
      replyRepository,
    });
  });

  describe("addReply", () => {
    it("should orchestrate the add reply action correctly", async () => {
      // Arrange
      const useCasePayload = { content: "reply content" };
      const threadId = "thread-123";
      const commentId = "comment-123";
      const owner = "user-123";
      const expectedAddedReply = {
        id: "reply-123",
        content: "reply content",
        owner,
      };
      threadRepository.verifyThreadAvailability.mockResolvedValue();
      commentRepository.verifyCommentAvailability.mockResolvedValue();
      replyRepository.addReply.mockResolvedValue(expectedAddedReply);

      // Act
      const result = await replyUseCase.addReply(
        useCasePayload,
        threadId,
        commentId,
        owner
      );

      // Assert
      expect(threadRepository.verifyThreadAvailability).toBeCalledWith(
        threadId
      );
      expect(commentRepository.verifyCommentAvailability).toBeCalledWith(
        commentId
      );
      expect(replyRepository.addReply).toBeCalledWith(expect.any(AddReply));
      expect(result).toEqual(expectedAddedReply);
    });
  });

  describe("deleteReply", () => {
    it("should orchestrate the delete reply action correctly", async () => {
      // Arrange
      const threadId = "thread-123";
      const commentId = "comment-123";
      const replyId = "reply-123";
      const owner = "user-123";
      threadRepository.verifyThreadAvailability.mockResolvedValue();
      commentRepository.verifyCommentAvailability.mockResolvedValue();
      replyRepository.verifyReplyOwner.mockResolvedValue();
      replyRepository.deleteReply.mockResolvedValue();

      // Act
      await replyUseCase.deleteReply(threadId, commentId, replyId, owner);

      // Assert
      expect(threadRepository.verifyThreadAvailability).toBeCalledWith(
        threadId
      );
      expect(commentRepository.verifyCommentAvailability).toBeCalledWith(
        commentId
      );
      expect(replyRepository.verifyReplyOwner).toBeCalledWith(replyId, owner);
      expect(replyRepository.deleteReply).toBeCalledWith(replyId);
    });

    it("should throw error if thread is not available", async () => {
      threadRepository.verifyThreadAvailability.mockRejectedValue(
        new Error("Thread not found")
      );
      await expect(
        replyUseCase.deleteReply(
          "thread-404",
          "comment-123",
          "reply-123",
          "user-123"
        )
      ).rejects.toThrow("Thread not found");
    });

    it("should throw error if comment is not available", async () => {
      threadRepository.verifyThreadAvailability.mockResolvedValue();
      commentRepository.verifyCommentAvailability.mockRejectedValue(
        new Error("Comment not found")
      );
      await expect(
        replyUseCase.deleteReply(
          "thread-123",
          "comment-404",
          "reply-123",
          "user-123"
        )
      ).rejects.toThrow("Comment not found");
    });

    it("should throw error if reply owner verification fails", async () => {
      threadRepository.verifyThreadAvailability.mockResolvedValue();
      commentRepository.verifyCommentAvailability.mockResolvedValue();
      replyRepository.verifyReplyOwner.mockRejectedValue(
        new Error("Unauthorized")
      );
      await expect(
        replyUseCase.deleteReply(
          "thread-123",
          "comment-123",
          "reply-404",
          "user-123"
        )
      ).rejects.toThrow("Unauthorized");
    });
  });
});
