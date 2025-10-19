/* eslint-disable no-underscore-dangle */
/**
 * HealthCheckUseCase
 * Use case for checking application health and database connectivity
 * Follows clean architecture pattern by separating business logic from infrastructure
 */
class HealthCheckUseCase {
  constructor({ healthRepository }) {
    this._healthRepository = healthRepository;
  }

  /**
   * Execute health check
   * Verifies database connectivity and returns health status with HTTP status code
   *
   * @returns {Promise<Object>} Health status with statusCode, status, message, and data
   */
  async execute() {
    try {
      // Check database connection via repository
      // Repository handles the actual query execution
      const timestamp = await this._healthRepository.checkDatabaseConnection();

      return {
        statusCode: 200,
        status: 'ok',
        message: 'Server is healthy',
        timestamp,
        database: 'connected',
      };
    } catch (error) {
      // Return error response instead of throwing
      // This keeps error handling as part of business logic
      return {
        statusCode: 503,
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
      };
    }
  }
}

module.exports = HealthCheckUseCase;
