const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadUseCase = require('../ThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
    };

    const owner = 'user-123';

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: new CommentRepository(),
      replyRepository: new ReplyRepository(),
    });

    // Action
    const addedThread = await threadUseCase.addThread(useCasePayload, owner);

    // Assert
    expect(addedThread).toStrictEqual(
      new AddedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner,
      }),
    );
    expect(mockThreadRepository.addThread).toBeCalledWith(
      new AddThread(useCasePayload),
      owner,
    );
  });
});

describe('GetThreadUseCase', () => {
  it('should orchestrate fetching thread with comments and replies, mapping fields and dates', async () => {
    // Arrange
    const threadId = 'thread-123';
    const rawThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date('2023-08-17T10:20:30.000Z'),
      username: 'dicoding',
    };
    const commentsRaw = [
      {
        id: 'comment-1', username: 'userA', date: '2023-08-17T10:21:00.000Z', content: 'konten', is_delete: false,
      },
      {
        id: 'comment-2', username: 'userB', date: '2023-08-17T10:22:00.000Z', content: 'hapus', is_delete: true,
      },
    ];
    const repliesRaw = [
      {
        id: 'reply-1', username: 'userC', date: new Date('2023-08-17T10:23:00.000Z'), content: 'balasan', is_delete: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(rawThread);
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue(commentsRaw);
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockResolvedValueOnce(repliesRaw) // for comment-1
      .mockResolvedValueOnce([]); // for comment-2

    const useCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const view = await useCase.getThread(threadId);

    // Assert
    expect(view).toEqual({
      id: rawThread.id,
      title: rawThread.title,
      body: rawThread.body,
      date: '2023-08-17T10:20:30.000Z',
      username: rawThread.username,
      comments: [
        {
          id: 'comment-1',
          username: 'userA',
          date: '2023-08-17T10:21:00.000Z',
          content: 'konten',
          replies: [
            {
              id: 'reply-1',
              username: 'userC',
              date: '2023-08-17T10:23:00.000Z',
              content: 'balasan',
            },
          ],
        },
        {
          id: 'comment-2',
          username: 'userB',
          date: '2023-08-17T10:22:00.000Z',
          content: '**komentar telah dihapus**',
          replies: [],
        },
      ],
    });

    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledTimes(2);
  });

  it('should throw NotFoundError when thread is not found', async () => {
    // Arrange
    const threadId = 'thread-not-exist';
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(null);
    const useCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(useCase.getThread(threadId)).rejects.toThrowError('thread tidak ditemukan');
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
  });
});
