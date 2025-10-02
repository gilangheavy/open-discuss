/* istanbul ignore file */
const { execSync } = require("child_process");

function runMigrations() {
  // Run node-pg-migrate for the test database using the provided config
  execSync(
    "node ./node_modules/node-pg-migrate/bin/node-pg-migrate -f config/database/test.json up",
    {
      stdio: "inherit",
    }
  );
}

module.exports = runMigrations;
