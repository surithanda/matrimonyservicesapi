import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

// Resolve SSL CA: prefer inline env content, else path from env, else bundled PEM
function resolveSslCa(): string | undefined {
  const envCa = process.env.DB_SSL_CA;
  if (envCa && envCa.includes('BEGIN CERTIFICATE')) {
    return envCa;
  }

  const candidates: string[] = [];
  if (process.env.DB_SSL_CA_PATH) {
    candidates.push(process.env.DB_SSL_CA_PATH);
  }
  // Try common locations in both src and dist
  candidates.push(
    path.resolve(__dirname, 'combined-ca-certificates.pem'),
    path.resolve(process.cwd(), 'src', 'config', 'combined-ca-certificates.pem'),
    path.resolve(process.cwd(), 'dist', 'config', 'combined-ca-certificates.pem')
  );

  for (const p of candidates) {
    try {
      if (p && fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf8');
      }
    } catch {
      // ignore and continue
    }
  }

  return undefined;
}

const sslCa = resolveSslCa();
const forceSSL = process.env.DB_HOST?.includes('azure.com');

console.log('Database SSL Config:', forceSSL ? 'Enabled' : 'Disabled');
if (forceSSL && !sslCa) {
  console.warn('Warning: SSL is required but no CA certificate found. Connection may fail.');
}

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
  ...(forceSSL && sslCa && { ssl: {
    // Enforce TLS; Azure MySQL requires secure transport when enabled
    rejectUnauthorized: true,
    ca: sslCa,
    minVersion: 'TLSv1.2',
  } }),
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
