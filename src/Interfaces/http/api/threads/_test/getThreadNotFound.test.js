const ThreadsHandler = require('../handler');
const ThreadUseCase = require('../../../../../Applications/use_case/ThreadUseCase');
const NotFoundError = require('../../../../../Commons/exceptions/NotFoundError');

describe('ThreadsHandler getThreadByIdHandler NotFound branch', () => {
  it('should throw NotFoundError when thread not found (let middleware handle)', async () => {
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

    // Act & Assert: handler should throw error, not handle it
    await expect(handler.getThreadByIdHandler(request, h))
      .rejects
      .toThrow(NotFoundError);

    await expect(handler.getThreadByIdHandler(request, h))
      .rejects
      .toThrow('thread tidak ditemukan');
  });
});
