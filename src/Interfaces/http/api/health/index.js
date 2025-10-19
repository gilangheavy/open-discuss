const HealthHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'health',
  version: '1.0.0',
  register: async (server, { container }) => {
    const healthHandler = new HealthHandler(container);
    server.route(routes(healthHandler));
  },
};
