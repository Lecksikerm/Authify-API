const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, 
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected');
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
  }
})();

module.exports = { sequelize };

