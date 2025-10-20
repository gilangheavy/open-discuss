const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const HealthRepositoryPostgres = require('../../repository/HealthRepositoryPostgres');

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

    it('should return valid ISO 8601 timestamp format', async () => {
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

      // Check ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(responseJson.timestamp).toMatch(isoRegex);

      // Timestamp should be recent (within last 5 seconds)
      const timestampDate = new Date(responseJson.timestamp);
      const now = new Date();
      const diffMs = now - timestampDate;
      expect(diffMs).toBeLessThan(5000); // Less than 5 seconds
    });

    it('should respond quickly (performance test)', async () => {
      // Arrange
      const server = await createServer(container);
      const startTime = Date.now();

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      // Assert
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.statusCode).toEqual(200);
      expect(responseTime).toBeLessThan(200); // Should respond in less than 200ms
    });

    it('should handle concurrent requests correctly', async () => {
      // Arrange
      const server = await createServer(container);
      const concurrentRequests = 10;

      // Action - Send 10 concurrent requests
      const promises = Array(concurrentRequests).fill(null).map(() => server.inject({
        method: 'GET',
        url: '/health',
      }));
      const responses = await Promise.all(promises);

      // Assert - All should succeed
      responses.forEach((response) => {
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('ok');
        expect(responseJson.database).toEqual('connected');
      });
    });

    it('should not require authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action - Request without Authorization header
      const response = await server.inject({
        method: 'GET',
        url: '/health',
        headers: {}, // Explicitly no auth header
      });

      // Assert
      expect(response.statusCode).toEqual(200); // Should NOT return 401
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('ok');
    });
  });

  describe('when invalid HTTP method', () => {
    it('should return 404 for POST /health', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/health',
        payload: {},
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });

    it('should return 404 for PUT /health', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/health',
        payload: {},
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });

    it('should return 404 for DELETE /health', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/health',
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
  });

  describe('when database connection fails', () => {
    it('should return 503 when database is unavailable', async () => {
      // Arrange - Mock pool to simulate DB failure
      const originalQuery = pool.query;
      pool.query = jest.fn().mockRejectedValue(new Error('Connection refused'));

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      // Assert
      expect(response.statusCode).toEqual(503);
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('error');
      expect(responseJson.message).toContain('Database connection failed');
      expect(responseJson.error).toBeDefined();

      // Cleanup - Restore original query
      pool.query = originalQuery;
    });

    it('should return 503 with proper error message when DB timeout', async () => {
      // Arrange - Mock pool to simulate timeout
      const originalQuery = pool.query;
      pool.query = jest.fn().mockRejectedValue(new Error('Connection timeout'));

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      // Assert
      expect(response.statusCode).toEqual(503);
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('error');
      expect(responseJson.message).toEqual('Database connection failed');
      expect(responseJson.error).toContain('timeout');

      // Cleanup - Restore original query
      pool.query = originalQuery;
    });
  });

  describe('integration test with real database', () => {
    it('should successfully query database and return connection info', async () => {
      // Arrange
      const healthRepository = new HealthRepositoryPostgres(pool);
      const server = await createServer(container);

      // Action - First verify DB is actually connected
      const dbTimestamp = await healthRepository.checkDatabaseConnection();
      expect(dbTimestamp).toBeInstanceOf(Date);

      // Then check endpoint
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.database).toEqual('connected');
    });

    it('should maintain consistent response structure across multiple calls', async () => {
      // Arrange
      const server = await createServer(container);
      const expectedKeys = ['status', 'message', 'timestamp', 'database'];

      // Action - Make 3 sequential calls using Promise.all
      const promises = [1, 2, 3].map(() => server.inject({
        method: 'GET',
        url: '/health',
      }));
      const rawResponses = await Promise.all(promises);
      const responses = rawResponses.map((r) => JSON.parse(r.payload));

      // Assert - All responses should have same structure
      responses.forEach((responseJson) => {
        expect(Object.keys(responseJson).sort()).toEqual(expectedKeys.sort());
        expect(responseJson.status).toEqual('ok');
        expect(responseJson.database).toEqual('connected');
      });
    });
  });
});
