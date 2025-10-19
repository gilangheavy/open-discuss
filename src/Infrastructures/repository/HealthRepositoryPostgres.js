/* eslint-disable no-underscore-dangle */
const HealthRepository = require('../../Domains/health/HealthRepository');

/**
 * HealthRepositoryPostgres
 * Concrete implementation of HealthRepository using PostgreSQL
 * Handles database connectivity checks
 */
class HealthRepositoryPostgres extends HealthRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  /**
   * Check database connectivity
   * Executes a simple query to verify database is accessible
   *
   * @returns {Promise<Date>} Current database timestamp
   * @throws {Error} If database query fails
   */
  async checkDatabaseConnection() {
    const query = {
      text: 'SELECT NOW() as current_time',
    };

    const result = await this._pool.query(query);
    return result.rows[0].current_time;
  }
}

module.exports = HealthRepositoryPostgres;
