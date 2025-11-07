require('dotenv').config();
const app = require('./src/app');
require('./src/config/redis'); 
const { sequelize } = require('./src/config/db');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected');

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Database connection failed:', error);
  }
})();

