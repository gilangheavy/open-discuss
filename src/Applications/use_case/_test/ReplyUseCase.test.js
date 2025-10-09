const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyUseCase = require('../ReplyUseCase');

describe('ReplyUseCase', () => {
  let mockThreadRepository;
  let mockCommentRepository;
  let mockReplyRepository;
  let replyUseCase;

  beforeEach(() => {
    mockThreadRepository = new ThreadRepository();
    mockCommentRepository = new CommentRepository();
    mockReplyRepository = new ReplyRepository();
    // Mocking the methods of the repositories
    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve(1));
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve(1));
    mockReplyRepository.addReply = jest.fn(() => Promise.resolve({}));
    mockReplyRepository.verifyReplyAvailability = jest.fn(() => Promise.resolve(1));
    mockReplyRepository.verifyReplyOwner = jest.fn(() => Promise.resolve({ id: 'reply-123', owner: 'user-123' }));
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve());
    replyUseCase = new ReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });
  });

  describe('addReply', () => {
    it('should orchestrate the add reply action correctly', async () => {
      // Arrange
      const useCasePayload = { content: 'reply content' };
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const owner = 'user-123';

      const mockAddedReply = new AddedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner,
      });

      mockThreadRepository.verifyThreadAvailability.mockResolvedValue(1);
      mockCommentRepository.verifyCommentAvailability.mockResolvedValue(1);
      mockReplyRepository.addReply.mockResolvedValue(mockAddedReply);

      // Act
      const addedReply = await replyUseCase.addReply(
        useCasePayload,
        threadId,
        commentId,
        owner,
      );

      // Assert
      expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(
        threadId,
      );
      expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(
        commentId,
      );
      expect(mockReplyRepository.addReply).toBeCalledWith(
        new AddReply({
          content: useCasePayload.content,
          threadId,
          commentId,
          owner,
        }),
      );

      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: useCasePayload.content,
          owner,
        }),
      );
    });

    it('should throw error when thread not found on addReply', async () => {
      mockThreadRepository.verifyThreadAvailability.mockResolvedValue(0);
      await expect(
        replyUseCase.addReply({ content: 'hey' }, 'thread-x', 'comment-1', 'user-1'),
      ).rejects.toThrow('thread tidak ditemukan');
    });

    it('should throw error when comment not found on addReply', async () => {
      mockThreadRepository.verifyThreadAvailability.mockResolvedValue(1);
      mockCommentRepository.verifyCommentAvailability.mockResolvedValue(0);
      await expect(
        replyUseCase.addReply({ content: 'hey' }, 'thread-1', 'comment-x', 'user-1'),
      ).rejects.toThrow('komentar tidak ditemukan');
    });
  });

  describe('deleteReply', () => {
    it('should orchestrate the delete reply action correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const owner = 'user-123';
      mockThreadRepository.verifyThreadAvailability.mockResolvedValue(1);
      mockCommentRepository.verifyCommentAvailability.mockResolvedValue(1);
      mockReplyRepository.verifyReplyOwner.mockResolvedValue({
        id: replyId,
        owner,
      });
      mockReplyRepository.deleteReply.mockResolvedValue();

      // Act
      await replyUseCase.deleteReply(threadId, commentId, replyId, owner);

      // Assert
      expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(
        threadId,
      );
      expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(
        commentId,
      );
      expect(mockReplyRepository.verifyReplyAvailability).toBeCalledWith(replyId);
      expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(replyId);
      expect(mockReplyRepository.deleteReply).toBeCalledWith(replyId);
    });

    it('should throw error if thread is not available', async () => {
      mockThreadRepository.verifyThreadAvailability.mockResolvedValue(0);
      await expect(
        replyUseCase.deleteReply(
          'thread-404',
          'comment-123',
          'reply-123',
          'user-123',
        ),
      ).rejects.toThrow('thread tidak ditemukan');
    });

    it('should throw error if comment is not available', async () => {
      mockThreadRepository.verifyThreadAvailability.mockResolvedValue(1);
      mockCommentRepository.verifyCommentAvailability.mockResolvedValue(0);
      await expect(
        replyUseCase.deleteReply(
          'thread-123',
          'comment-404',
          'reply-123',
          'user-123',
        ),
      ).rejects.toThrow('komentar tidak ditemukan');
    });

    it('should throw error if reply not found', async () => {
      mockThreadRepository.verifyThreadAvailability.mockResolvedValue(1);
      mockCommentRepository.verifyCommentAvailability.mockResolvedValue(1);
      mockReplyRepository.verifyReplyAvailability.mockResolvedValue(0);
      await expect(
        replyUseCase.deleteReply(
          'thread-123',
          'comment-123',
          'reply-x',
          'user-123',
        ),
      ).rejects.toThrow('balasan tidak ditemukan');
    });

    it('should throw error if reply exists but owner different', async () => {
      mockThreadRepository.verifyThreadAvailability.mockResolvedValue(1);
      mockCommentRepository.verifyCommentAvailability.mockResolvedValue(1);
      mockReplyRepository.verifyReplyAvailability.mockResolvedValue(1);
      mockReplyRepository.verifyReplyOwner.mockResolvedValue({ id: 'reply-123', owner: 'other-user' });
      await expect(
        replyUseCase.deleteReply('thread-123', 'comment-123', 'reply-123', 'user-123'),
      ).rejects.toThrow('anda tidak berhak mengakses resource ini');
    });

    it('should throw error if reply availability ok but owner data missing', async () => {
      mockThreadRepository.verifyThreadAvailability.mockResolvedValue(1);
      mockCommentRepository.verifyCommentAvailability.mockResolvedValue(1);
      mockReplyRepository.verifyReplyAvailability.mockResolvedValue(1);
      mockReplyRepository.verifyReplyOwner.mockResolvedValue(undefined);
      await expect(
        replyUseCase.deleteReply('thread-123', 'comment-123', 'reply-zzz', 'user-123'),
      ).rejects.toThrow('balasan tidak ditemukan');
    });
  });
});
