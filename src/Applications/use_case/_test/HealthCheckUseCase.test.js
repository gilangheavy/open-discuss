const HealthCheckUseCase = require('../HealthCheckUseCase');
const HealthRepository = require('../../../Domains/health/HealthRepository');

describe('HealthCheckUseCase', () => {
  describe('execute function', () => {
    it('should return health status with 200 when database is connected', async () => {
      // Arrange
      const mockHealthRepository = new HealthRepository();
      mockHealthRepository.checkDatabaseConnection = jest
        .fn()
        .mockResolvedValue(new Date('2025-10-19T00:00:00.000Z'));

      const healthCheckUseCase = new HealthCheckUseCase({
        healthRepository: mockHealthRepository,
      });

      // Action
      const result = await healthCheckUseCase.execute();

      // Assert
      expect(mockHealthRepository.checkDatabaseConnection).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        status: 'ok',
        message: 'Server is healthy',
        timestamp: new Date('2025-10-19T00:00:00.000Z'),
        database: 'connected',
      });
    });

    it('should return error status with 503 when database connection fails', async () => {
      // Arrange
      const mockHealthRepository = new HealthRepository();
      mockHealthRepository.checkDatabaseConnection = jest
        .fn()
        .mockRejectedValue(new Error('Connection timeout'));

      const healthCheckUseCase = new HealthCheckUseCase({
        healthRepository: mockHealthRepository,
      });

      // Action
      const result = await healthCheckUseCase.execute();

      // Assert
      expect(mockHealthRepository.checkDatabaseConnection).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 503,
        status: 'error',
        message: 'Database connection failed',
        error: 'Connection timeout',
      });
    });
  });
});
