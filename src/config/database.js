/* 
  Database configuration file
*/
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('connect', () => {
  console.log('Connection to PostgreSQL successful');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};