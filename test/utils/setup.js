
const {
  clearDatabase, migrateDatabase, createTestDatabase,
} = require('./db-handler');

beforeAll(async () => {
  jest.setTimeout(70000);
  await createTestDatabase();
  await migrateDatabase();
});

/**
 * Mock
 */
beforeEach(async (done) => {
  await clearDatabase();
  done();
});

/**
 * Remove and close the db and server.
 */
afterAll(async () => {
  await clearDatabase();
});
