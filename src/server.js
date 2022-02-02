const { logger } = require('leadrouting-common/libs');
const {
  ENVIRONMENT: { DEVELOPMENT, QA },
} = require('./constants');
const runMigrations = require('./services/runMigrations');
const app = require('./app');

const runServer = () => {
  app.listen(8080, () => logger.info('Leadrouting API is listening on port 8080'));
};

(async () => {
  // Run migrations automatically only on selected servers
  if ([DEVELOPMENT, QA].includes(process.env.NODE_ENV)) await runMigrations();
  runServer();
})();
