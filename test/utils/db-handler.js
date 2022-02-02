/* eslint-disable */
const models = require('leadrouting-common/models');
const { exec } = require('child_process');

const createTestDatabase = async () => {
  await new Promise((resolve) => {
    exec(
      'npm run db:pre-migrate',
      {},
      (err) => (err ? resolve() : resolve()),
    );
  });
};

const clearDatabase = async () => {
  // eslint-disable-next-line no-restricted-syntax
  const modelObjects = Object.values(models);
  while (modelObjects.length) {
    const model = modelObjects.pop();
    try {
      await model.destroy({ where: {}, force: true });
    } catch (error) {
      modelObjects.unshift(model);
    }
  }
};
const migrateDatabase = async () => {
  await new Promise((resolve) => {
    exec(
      'npm run db:migrate',
      {},
      (err) => (err ? resolve() : resolve()),
    );
  });
};
const rollbackeDatabase = async () => {
  await new Promise((resolve, reject) => {
    exec(
      'npm run db:migrate:undo:all',
      {},
      (err) => (err ? reject(err) : resolve()),
    );
  });
};

module.exports = {
  clearDatabase,
  migrateDatabase,
  rollbackeDatabase,
  createTestDatabase,
};
