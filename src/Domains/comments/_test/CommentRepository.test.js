const CommentRepository = require('../CommentRepository');

describe('CommentRepository abstract class', () => {
  let commentRepository;

  beforeEach(() => {
    commentRepository = new CommentRepository();
  });

  test('addComment should throw error when not implemented', async () => {
    await expect(commentRepository.addComment({})).rejects.toThrowError(
      'THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  test('verifyCommentOwner should throw error when not implemented', async () => {
    await expect(
      commentRepository.verifyCommentOwner('comment-123', 'user-123'),
    ).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  test('deleteComment should throw error when not implemented', async () => {
    await expect(
      commentRepository.deleteComment('comment-123'),
    ).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  test('getCommentsByThreadId should throw error when not implemented', async () => {
    await expect(
      commentRepository.getCommentsByThreadId('thread-123'),
    ).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  test('verifyCommentAvailability should throw error when not implemented', async () => {
    await expect(
      commentRepository.verifyCommentAvailability('comment-123'),
    ).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});

// We recommend installing an extension to run jest tests.
