const ThreadsHandler = require('../handler');
const ThreadUseCase = require('../../../../../Applications/use_case/ThreadUseCase');
// mapping moved into use case

describe('ThreadsHandler getThreadByIdHandler deleted content branches', () => {
  it('should replace content with deletion markers for deleted comment and reply', async () => {
    // Arrange
    const fakeThread = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      date: '2023-08-17T10:20:30.000Z',
      username: 'dicoding',
    };

    const deletedComment = {
      id: 'comment-1',
      username: 'userA',
      date: '2023-08-17T10:21:00.000Z',
      content: 'original content',
      is_delete: true,
    };

    const deletedReply = {
      id: 'reply-1',
      username: 'userB',
      date: '2023-08-17T10:22:00.000Z',
      content: 'reply content',
      is_delete: true,
    };

    const mockContainer = {
      getInstance: (name) => {
        if (name === ThreadUseCase.name) {
          return {
            getThread: jest.fn().mockResolvedValue({
              ...fakeThread,
              comments: [
                {
                  id: deletedComment.id,
                  username: deletedComment.username,
                  date: deletedComment.date,
                  content: '**komentar telah dihapus**',
                  replies: [
                    {
                      id: deletedReply.id,
                      username: deletedReply.username,
                      date: deletedReply.date,
                      content: '**balasan telah dihapus**',
                    },
                  ],
                },
              ],
            }),
          };
        }
        throw new Error(`Unexpected dependency request: ${name}`);
      },
    };

    const handler = new ThreadsHandler(mockContainer);

    const request = { params: { threadId: 'thread-123' } };

    const h = {
      response: (payload) => {
        const res = {
          source: payload,
          code: function c(statusCode) { this.statusCode = statusCode; return this; },
        };
        return res;
      },
    };

    // Act
    const response = await handler.getThreadByIdHandler(request, h);

    // Assert
    expect(response.statusCode).toBe(200);
    const { thread } = response.source.data;
    expect(thread.comments).toHaveLength(1);
    expect(thread.comments[0].content).toBe('**komentar telah dihapus**');
    expect(thread.comments[0].replies[0].content).toBe('**balasan telah dihapus**');
  });
});
