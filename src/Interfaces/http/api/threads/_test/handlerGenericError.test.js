const createServer = require('../../../../../Infrastructures/http/createServer');
const container = require('../../../../../Infrastructures/container');
const ThreadUseCase = require('../../../../../Applications/use_case/ThreadUseCase');

describe('ThreadsHandler generic error branch', () => {
  let originalGetInstance;

  beforeAll(() => {
    originalGetInstance = container.getInstance.bind(container);
  });

  afterAll(() => {
    // restore
    container.getInstance = originalGetInstance;
  });

  test('should return 500 when unexpected error occurs in getThreadByIdHandler', async () => {
    container.getInstance = (key) => {
      if (key === ThreadUseCase.name) {
        return { getThread: () => { throw new Error('unexpected boom'); } };
      }
      return originalGetInstance(key);
    };

    const server = await createServer(container);
    const res = await server.inject({ method: 'GET', url: '/threads/thread-xyz' });
    expect(res.statusCode).toBe(500);
    const json = JSON.parse(res.payload);
    expect(json.status).toBe('error');
  });
});
