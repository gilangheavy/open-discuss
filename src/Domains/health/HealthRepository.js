/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */

/**
 * HealthRepository
 * Abstract repository for health check operations
 * Defines contract for checking database connectivity
 */
class HealthRepository {
  /**
   * Check database connectivity
   * Must be implemented by concrete repository
   *
   * @returns {Promise<Date>} Current database timestamp
   * @throws {Error} If database connection fails
   */
  async checkDatabaseConnection() {
    throw new Error('HEALTH_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = HealthRepository;
