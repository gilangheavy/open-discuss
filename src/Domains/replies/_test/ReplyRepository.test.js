const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository abstract methods', () => {
  let repo;
  beforeEach(() => {
    repo = new ReplyRepository();
  });

  const errorMsg = 'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED';

  test('addReply throws', async () => {
    await expect(repo.addReply({})).rejects.toThrow(errorMsg);
  });

  test('verifyReplyOwner throws', async () => {
    await expect(repo.verifyReplyOwner('reply-1')).rejects.toThrow(errorMsg);
  });

  test('deleteReply throws', async () => {
    await expect(repo.deleteReply('reply-1')).rejects.toThrow(errorMsg);
  });

  test('getRepliesByCommentId throws', async () => {
    await expect(repo.getRepliesByCommentId('comment-1')).rejects.toThrow(errorMsg);
  });

  test('verifyReplyAvailability throws', async () => {
    await expect(repo.verifyReplyAvailability('reply-1')).rejects.toThrow(errorMsg);
  });
});

describe('ReplyRepository', () => {
  let replyRepository;

  beforeEach(() => {
    replyRepository = new ReplyRepository();
  });

  describe('addReply', () => {
    it('should add a reply and return the added reply', async () => {
      const replyPayload = {
        content: 'This is a reply',
        threadId: 'thread-123',
        commentId: 'comment-123',
        owner: 'user-123',
      };

      // Mock implementation
      replyRepository.addReply = jest.fn().mockResolvedValue({
        id: 'reply-123',
        ...replyPayload,
        date: new Date().toISOString(),
      });

      const result = await replyRepository.addReply(replyPayload);

      expect(replyRepository.addReply).toHaveBeenCalledWith(replyPayload);
      expect(result).toHaveProperty('id', 'reply-123');
      expect(result).toHaveProperty('content', replyPayload.content);
      expect(result).toHaveProperty('owner', replyPayload.owner);
    });
  });

  describe('getRepliesByCommentId', () => {
    it('should return replies for a given comment id', async () => {
      const commentId = 'comment-123';
      const replies = [
        {
          id: 'reply-1',
          content: 'Reply 1',
          owner: 'user-1',
          date: '2024-06-01',
        },
        {
          id: 'reply-2',
          content: 'Reply 2',
          owner: 'user-2',
          date: '2024-06-02',
        },
      ];

      replyRepository.getRepliesByCommentId = jest
        .fn()
        .mockResolvedValue(replies);

      const result = await replyRepository.getRepliesByCommentId(commentId);

      expect(replyRepository.getRepliesByCommentId).toHaveBeenCalledWith(
        commentId,
      );
      expect(result).toEqual(replies);
    });
  });

  describe('deleteReply', () => {
    it('should delete a reply by id', async () => {
      const replyId = 'reply-123';

      replyRepository.deleteReply = jest.fn().mockResolvedValue(true);

      const result = await replyRepository.deleteReply(replyId);

      expect(replyRepository.deleteReply).toHaveBeenCalledWith(replyId);
      expect(result).toBe(true);
    });
  });

  describe('verifyReplyOwner', () => {
    it('should verify reply owner', async () => {
      const replyId = 'reply-123';
      const owner = 'user-123';

      replyRepository.verifyReplyOwner = jest.fn().mockResolvedValue(true);

      const result = await replyRepository.verifyReplyOwner(replyId, owner);

      expect(replyRepository.verifyReplyOwner).toHaveBeenCalledWith(
        replyId,
        owner,
      );
      expect(result).toBe(true);
    });
  });
});
