const HealthHandler = require('./handler');
const routes = require('./routes');

/**
 * Health plugin
 * Registers health check endpoint for monitoring application and database status
 */
module.exports = {
  name: 'health',
  version: '1.0.0',
  register: async (server, { container }) => {
    const healthHandler = new HealthHandler(container);
    server.route(routes(healthHandler));
  },
};
