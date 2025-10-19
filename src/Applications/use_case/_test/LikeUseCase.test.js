const LikeUseCase = require('../LikeUseCase');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('LikeUseCase', () => {
  describe('execute function', () => {
    it('should throw error when thread not found', async () => {
      // Arrange
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockLikeRepository = new LikeRepository();

      mockThreadRepository.verifyThreadAvailability = jest.fn()
        .mockResolvedValue(0);

      const likeUseCase = new LikeUseCase({
        likeRepository: mockLikeRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action & Assert
      await expect(likeUseCase.execute('thread-123', 'comment-123', 'user-123'))
        .rejects.toThrow('THREAD.NOT_FOUND');
      expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith('thread-123');
    });

    it('should throw error when comment not found', async () => {
      // Arrange
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockLikeRepository = new LikeRepository();

      mockThreadRepository.verifyThreadAvailability = jest.fn()
        .mockResolvedValue(1);
      mockCommentRepository.verifyCommentAvailability = jest.fn()
        .mockResolvedValue(0);

      const likeUseCase = new LikeUseCase({
        likeRepository: mockLikeRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action & Assert
      await expect(likeUseCase.execute('thread-123', 'comment-123', 'user-123'))
        .rejects.toThrow('COMMENT.NOT_FOUND');
      expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepository.verifyCommentAvailability)
        .toHaveBeenCalledWith('comment-123');
    });

    it('should add like when user has not liked comment', async () => {
      // Arrange
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockLikeRepository = new LikeRepository();

      mockThreadRepository.verifyThreadAvailability = jest.fn()
        .mockResolvedValue(1);
      mockCommentRepository.verifyCommentAvailability = jest.fn()
        .mockResolvedValue(1);
      mockLikeRepository.hasUserLikedComment = jest.fn()
        .mockResolvedValue(false);
      mockLikeRepository.addLike = jest.fn()
        .mockResolvedValue();

      const likeUseCase = new LikeUseCase({
        likeRepository: mockLikeRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action
      await likeUseCase.execute('thread-123', 'comment-123', 'user-123');

      // Assert
      expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepository.verifyCommentAvailability)
        .toHaveBeenCalledWith('comment-123');
      expect(mockLikeRepository.hasUserLikedComment)
        .toHaveBeenCalledWith('comment-123', 'user-123');
      expect(mockLikeRepository.addLike)
        .toHaveBeenCalledWith('comment-123', 'user-123');
    });

    it('should remove like when user has already liked comment', async () => {
      // Arrange
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockLikeRepository = new LikeRepository();

      mockThreadRepository.verifyThreadAvailability = jest.fn()
        .mockResolvedValue(1);
      mockCommentRepository.verifyCommentAvailability = jest.fn()
        .mockResolvedValue(1);
      mockLikeRepository.hasUserLikedComment = jest.fn()
        .mockResolvedValue(true);
      mockLikeRepository.removeLike = jest.fn()
        .mockResolvedValue();

      const likeUseCase = new LikeUseCase({
        likeRepository: mockLikeRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action
      await likeUseCase.execute('thread-123', 'comment-123', 'user-123');

      // Assert
      expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepository.verifyCommentAvailability)
        .toHaveBeenCalledWith('comment-123');
      expect(mockLikeRepository.hasUserLikedComment)
        .toHaveBeenCalledWith('comment-123', 'user-123');
      expect(mockLikeRepository.removeLike)
        .toHaveBeenCalledWith('comment-123', 'user-123');
    });
  });
});
