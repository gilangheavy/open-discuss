const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');

describe('/health endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('when GET /health', () => {
    it('should response 200 and return health status', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('ok');
      expect(responseJson.message).toEqual('Server is healthy');
      expect(responseJson.database).toEqual('connected');
      expect(responseJson.timestamp).toBeDefined();
    });

    it('should check database connection', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.database).toEqual('connected');

      // Verify timestamp is a valid date
      const timestamp = new Date(responseJson.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toString()).not.toEqual('Invalid Date');
    });
  });
});
