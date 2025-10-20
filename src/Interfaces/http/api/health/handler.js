/* eslint-disable no-underscore-dangle */
const autoBind = require('auto-bind');

/**
 * HealthHandler
 * HTTP handler for health check endpoint
 * Follows clean architecture by delegating business logic to use case layer
 */
class HealthHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  /**
   * Handler for health check endpoint
   * Checks database connectivity and returns application health status
   * No try-catch needed here as use case handles all error scenarios
   *
   * @param {Object} request - Hapi request object
   * @param {Object} h - Hapi response toolkit
   * @returns {Promise<Object>} HTTP response with health status
   */
  async getHealthHandler(request, h) {
    // Get use case from DI container
    const healthCheckUseCase = this._container.getInstance(
      'HealthCheckUseCase',
    );

    // Execute use case to check health
    // Use case returns status object with statusCode
    const result = await healthCheckUseCase.execute();

    // Extract statusCode and prepare response payload
    const { statusCode, ...payload } = result;

    // Return response with appropriate status code
    const response = h.response(payload);
    response.code(statusCode);
    return response;
  }
}

module.exports = HealthHandler;
