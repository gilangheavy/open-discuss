const HealthRepositoryPostgres = require('../HealthRepositoryPostgres');
const pool = require('../../database/postgres/pool');

describe('HealthRepositoryPostgres', () => {
  afterEach(async () => {
    // No cleanup needed for health check
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('checkDatabaseConnection function', () => {
    it('should return current timestamp when database is connected', async () => {
      // Arrange
      const healthRepositoryPostgres = new HealthRepositoryPostgres(pool);

      // Action
      const timestamp = await healthRepositoryPostgres.checkDatabaseConnection();

      // Assert
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should throw error when database connection fails', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockRejectedValue(new Error('Connection refused')),
      };
      const healthRepositoryPostgres = new HealthRepositoryPostgres(mockPool);

      // Action & Assert
      await expect(
        healthRepositoryPostgres.checkDatabaseConnection(),
      ).rejects.toThrow('Connection refused');
      expect(mockPool.query).toHaveBeenCalledWith({
        text: 'SELECT NOW() as current_time',
      });
    });
  });
});
