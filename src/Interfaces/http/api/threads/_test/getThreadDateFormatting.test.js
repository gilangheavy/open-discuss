const ThreadsHandler = require('../handler');
const ThreadUseCase = require('../../../../../Applications/use_case/ThreadUseCase');
const CommentRepository = require('../../../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../../../Domains/replies/ReplyRepository');

describe('ThreadsHandler getThreadByIdHandler date formatting branch', () => {
  it('should convert Date instance to ISO string (covering instanceof Date branch)', async () => {
    // Arrange
    const dateObj = new Date('2023-08-17T10:20:30.000Z');
    const fakeThread = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      date: dateObj, // Date instance to hit the true branch
      username: 'dicoding',
    };

    const mockContainer = {
      getInstance: (name) => {
        if (name === ThreadUseCase.name) {
          return {
            getThread: jest.fn().mockResolvedValue(fakeThread),
          };
        }
        if (name === CommentRepository.name) {
          return {
            getCommentsByThreadId: jest.fn().mockResolvedValue([]),
          };
        }
        if (name === ReplyRepository.name) {
          return {
            getRepliesByCommentId: jest.fn().mockResolvedValue([]),
          };
        }
        throw new Error(`Unexpected dependency request: ${name}`);
      },
    };

    const handler = new ThreadsHandler(mockContainer);

    const request = {
      params: { threadId: 'thread-123' },
    };

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
    expect(response.source.status).toBe('success');
    expect(response.source.data.thread.date).toBe(dateObj.toISOString());
  });
});
