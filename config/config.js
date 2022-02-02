/* eslint-disable linebreak-style */
require('dotenv').config();

const {
  DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_HOST, DB_CONNECTION, CONSUMER_API_KEY,
} = process.env;
const config = {
  apiKey: CONSUMER_API_KEY,
  development: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    host: DB_HOST,
    dialect: DB_CONNECTION,
  },
  qa: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    host: DB_HOST,
    dialect: DB_CONNECTION,
  },
  production: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    host: DB_HOST,
    dialect: DB_CONNECTION,
  },
  test: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    host: DB_HOST,
    dialect: DB_CONNECTION,
  },
};

module.exports = config;
