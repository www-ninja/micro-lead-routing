require('./util/lightstep');
const Sentry = require('@sentry/node');
const express = require('express');
const { logger } = require('leadrouting-common/libs');
const validate = require('leadrouting-common/utils/collectUndefinedProps');
const commonConfig = require('leadrouting-common/config');
const config = require('../config');
const routes = require('./routes');
const { validateUuid } = require('./middlewares');
const sentry = require('./util/sentry');

const undefinedVariables = [...validate(config), ...validate(commonConfig)];
if (undefinedVariables.length) {
  logger.error(
    `Some environment variables are undefined - recheck the config file. [${undefinedVariables.join(', ')}]`,
  );
}

const app = express();

sentry(app);

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(express.json());
app.use(validateUuid);

app.get('/debug-sentry', () => {
  throw new Error('My first Sentry error!');
});

routes(app);

module.exports = app;
