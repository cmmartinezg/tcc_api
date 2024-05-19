const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://clickStore_owner:AnzBDmGLx80q@ep-jolly-frog-a5sbbxcy-pooler.us-east-2.aws.neon.tech/clickStore?sslmode=require',
});

pool.on('connect', () => {
  console.log('Conectado a la base de datos');
});

module.exports = pool;
