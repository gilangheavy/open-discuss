const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

const CommentUseCase = require('../CommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah comment',
    };
    const threadId = 'thread-123';
    const owner = 'user-123';

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve(1));
    mockCommentRepository.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    const commentUseCase = new CommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedComment = await commentUseCase.addComment(
      useCasePayload,
      threadId,
      owner,
    );

    // Assert
    expect(addedComment).toStrictEqual(
      new AddedComment({
        id: 'comment-123',
        content: useCasePayload.content,
        owner,
      }),
    );
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(
      threadId,
    );
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new AddComment({
        content: useCasePayload.content,
        threadId,
        owner,
      }),
    );
  });
});

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const owner = 'user-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve(1));
    mockCommentRepository.verifyCommentAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve(1));
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ id: commentId, owner }));
    mockCommentRepository.deleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const commentUseCase = new CommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await commentUseCase.deleteComment(threadId, commentId, owner);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(
      threadId,
    );
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(
      commentId,
    );
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      commentId,
      owner,
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith(commentId);
  });

  it('should throw error when thread not found on delete', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.verifyThreadAvailability = jest.fn().mockResolvedValue(0);
    const commentUseCase = new CommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
    await expect(
      commentUseCase.deleteComment('thread-x', 'comment-1', 'user-1'),
    ).rejects.toThrow('thread tidak ditemukan');
  });

  it('should throw error when comment not found on delete', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.verifyThreadAvailability = jest.fn().mockResolvedValue(1);
    mockCommentRepository.verifyCommentAvailability = jest.fn().mockResolvedValue(0);
    const commentUseCase = new CommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
    await expect(
      commentUseCase.deleteComment('thread-1', 'comment-x', 'user-1'),
    ).rejects.toThrow('komentar tidak ditemukan');
  });

  it('should throw error when verifyCommentOwner returns undefined', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.verifyThreadAvailability = jest.fn().mockResolvedValue(1);
    mockCommentRepository.verifyCommentAvailability = jest.fn().mockResolvedValue(1);
    mockCommentRepository.verifyCommentOwner = jest.fn().mockResolvedValue(undefined);
    const commentUseCase = new CommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
    await expect(
      commentUseCase.deleteComment('thread-1', 'comment-1', 'user-1'),
    ).rejects.toThrow('komentar tidak ditemukan');
  });

  it('should throw authorization error when owner mismatch', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.verifyThreadAvailability = jest.fn().mockResolvedValue(1);
    mockCommentRepository.verifyCommentAvailability = jest.fn().mockResolvedValue(1);
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockResolvedValue({ id: 'comment-1', owner: 'user-other' });
    const commentUseCase = new CommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
    await expect(
      commentUseCase.deleteComment('thread-1', 'comment-1', 'user-1'),
    ).rejects.toThrow('anda tidak berhak mengakses resource ini');
  });
});

describe('AddCommentUseCase edge', () => {
  it('should throw NotFoundError when thread not found on add', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.verifyThreadAvailability = jest.fn().mockResolvedValue(0);
    const commentUseCase = new CommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
    await expect(
      commentUseCase.addComment({ content: 'x' }, 'thread-x', 'user-1'),
    ).rejects.toThrow('thread tidak ditemukan');
  });
});
