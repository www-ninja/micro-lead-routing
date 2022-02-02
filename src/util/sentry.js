const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

const { IGNORE_ERRORS } = require('../constants');

module.exports = (app) => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({
        // to trace all requests to the default router
        app,
        // alternatively, you can specify the routes you want to trace:
        // router: someRouter,
      }),
    ],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
    // beforeSend is called immediately before the event is sent to the server
    beforeSend(event, hint) {
      const error = hint.originalException;
      if (
        error
      && error.status
      && IGNORE_ERRORS.includes(error.status)
      ) {
        return null;
      }
      return event;
    },
  });
};
