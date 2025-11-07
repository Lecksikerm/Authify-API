require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/db');
const redis = require('./src/config/redis');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected');
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error('Database connection failed:', error);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();


