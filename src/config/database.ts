import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Function to get SSL configuration
const getSSLConfig = () => {
  const sslMode = process.env.DB_SSL_MODE;
  
  if (!sslMode) {
    // Default: if no SSL mode specified but we have SSL errors, handle self-signed certs
    return { rejectUnauthorized: false };
  }
  
  switch (sslMode.toLowerCase()) {
    case 'disabled':
    case 'false':
      return undefined; // No SSL
    case 'require':
      return process.env.DB_SSL_CA 
        ? { ca: process.env.DB_SSL_CA }
        : { rejectUnauthorized: false };
    case 'allow-self-signed':
    case 'self-signed':
      return { rejectUnauthorized: false };
    default:
      return { rejectUnauthorized: false };
  }
};

const sslConfig = getSSLConfig();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: 3306,
  password: process.env.DB_PASSWORD || '#eptember@2024',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  multipleStatements: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  namedPlaceholders: true,
  dateStrings: true,
  connectTimeout: 10000,
  ...(sslConfig && { ssl: sslConfig }),
};

const pool = mysql.createPool(dbConfig);

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (err: any) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
};

testConnection();

export default pool; 
