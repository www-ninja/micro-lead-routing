process.env.LIGHTSTEP_DISABLED = 1;

module.exports = {
  displayName: 'leadrouting-micro',
  clearMocks: true,
  resetMocks: true,
  resetModules: true,
  testEnvironment: 'node',
  verbose: true,
  testMatch: [
    '**/test/**/*.test.(js)',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['./test/utils/setup.js'],
  globalSetup: '<rootDir>/test/utils/dotenv-test.js',
};
