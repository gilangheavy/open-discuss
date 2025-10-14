const ThreadsHandler = require('../handler');
const ThreadUseCase = require('../../../../../Applications/use_case/ThreadUseCase');
const NotFoundError = require('../../../../../Commons/exceptions/NotFoundError');

describe('ThreadsHandler getThreadByIdHandler NotFound branch', () => {
  it('should respond 404 and fail status when thread not found', async () => {
    // Arrange
    const mockContainer = {
      getInstance: (name) => {
        if (name === ThreadUseCase.name) {
          return {
            getThread: jest.fn().mockRejectedValue(new NotFoundError('thread tidak ditemukan')),
          };
        }
        throw new Error(`Unexpected dependency request: ${name}`);
      },
    };

    const handler = new ThreadsHandler(mockContainer);

    const request = { params: { threadId: 'thread-xxx' } };

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
    expect(response.statusCode).toBe(404);
    expect(response.source.status).toBe('fail');
    expect(response.source.message).toBe('thread tidak ditemukan');
  });
});
