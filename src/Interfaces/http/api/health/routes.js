/* eslint-disable import/no-extraneous-dependencies */
const Joi = require('joi');

/**
 * Routes untuk health check endpoint
 * Endpoint ini digunakan untuk monitoring status aplikasi dan koneksi database
 */
const routes = (handler) => ([
  {
    method: 'GET',
    path: '/health',
    handler: handler.getHealthHandler,
    options: {
      auth: false,
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
