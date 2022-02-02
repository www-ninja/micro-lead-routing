const opentracing = require('opentracing');
const lsTrace = require('ls-trace');
const { hostname } = require('os');

const lightstepEnabled = !JSON.parse(String(process.env.LIGHTSTEP_DISABLED || 0).toLowerCase());

if (lightstepEnabled) {
  const tracer = lsTrace.init({
    url: process.env.LIGHTSTEP_URL,
    tags: {
      service: {
        version: process.env.npm_package_version,
      },
      deployment: {
        environment: process.env.NODE_ENV,
      },
      lightstep: {
        service_name: process.env.npm_package_name,
        access_token: process.env.LIGHTSTEP_TOKEN,
      },
      hostname: hostname(),
    },
    experimental: {
      b3: true,
    },
  });

  opentracing.initGlobalTracer(tracer);
}
