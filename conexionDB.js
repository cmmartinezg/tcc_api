const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://Click%20Store_owner:zjCRdbrO4cg2@ep-restless-mountain-a5ljzzek.us-east-2.aws.neon.tech/Click%20Store?sslmode=require',
});

pool.on('connect', () => {
  console.log('Conectado a la base de datos');
});

module.exports = pool;
