/* eslint-disable import/no-extraneous-dependencies */
const Joi = require('joi');

/**
 * Routes for health check endpoint
 * This endpoint is used for monitoring application status and database connectivity
 * Typically called by load balancers, monitoring tools, or CI/CD pipelines
 */
const routes = (handler) => ([
  {
    method: 'GET',
    path: '/health',
    handler: handler.getHealthHandler,
    options: {
      auth: false, // No authentication required for health checks
      description: 'Health check endpoint',
      notes: 'Check application health and database connectivity',
      tags: ['api', 'Health'],
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Server is healthy',
              schema: Joi.object({
                status: Joi.string().example('ok'),
                message: Joi.string().example('Server is healthy'),
                timestamp: Joi.date(),
                database: Joi.string().example('connected'),
              }).label('HealthCheckResponse'),
            },
            503: {
              description: 'Service unavailable - Database connection failed',
            },
          },
        },
      },
    },
  },
]);

module.exports = routes;
