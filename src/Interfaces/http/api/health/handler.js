/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/**
 * Health check handler untuk monitoring status aplikasi dan koneksi database
 */
class HealthHandler {
  constructor(container) {
    this._container = container;
    this.getHealthHandler = this.getHealthHandler.bind(this);
  }

  /**
   * Handler untuk endpoint health check
   * Memeriksa koneksi database dan mengembalikan status aplikasi
   *
   * @param {Object} request - Hapi request object
   * @param {Object} h - Hapi response toolkit
   * @returns {Object} Response dengan status dan message
   */
  async getHealthHandler(request, h) {
    try {
      // Import pool directly untuk health check
      // eslint-disable-next-line global-require
      const pool = require('../../../../Infrastructures/database/postgres/pool');

      // Test database connection dengan simple query
      const result = await pool.query('SELECT NOW()');

      const response = h.response({
        status: 'ok',
        message: 'Server is healthy',
        timestamp: result.rows[0].now,
        database: 'connected',
      });
      response.code(200);
      return response;
    } catch (error) {
      const response = h.response({
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
      });
      response.code(503);
      return response;
    }
  }
}

module.exports = HealthHandler;
