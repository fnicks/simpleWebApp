require('dotenv').config();

module.exports = {
  development: {
    database: process.env.DB_NAME || 'postgres',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
  },
  test: {
    database: process.env.DB_NAME || 'postgres',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'postgres',
    dialect: 'postgres',
    logging: false,
  },
};
