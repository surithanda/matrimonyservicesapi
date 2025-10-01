import cors from 'cors';
import pool from '../config/database';

// Default allowed origins
let allowedOrigins = [
  'http://localhost:3000', 
  /^https:\/\/matrimonyservices-[a-zA-Z0-9]+-superreaders-projects\.vercel\.app$/,
  "https://matrimonyservices.vercel.app"
];

// Function to load active domains from database
async function loadAllowedOrigins(): Promise<void> {
  try {
    const query = `CALL api_clients_get(null, null)`;
    
    const [results] = await pool.execute(query) as any;
    const rows = results[0]; // Stored procedure results are nested in an array
    
    // Add database domains to allowedOrigins array
    const dbDomains = rows.map((row: any) => row.partner_root_domain);
    
    // Merge with existing origins, avoiding duplicates
    const existingOrigins = allowedOrigins.filter(origin => typeof origin === 'string');
    const existingRegexOrigins = allowedOrigins.filter(origin => origin instanceof RegExp);
    
    const uniqueDomains = [...new Set([...existingOrigins, ...dbDomains])];
    allowedOrigins = [...uniqueDomains, ...existingRegexOrigins];
    
    console.log('Loaded allowed origins from database:', allowedOrigins);
  } catch (error) {
    console.error('Error loading allowed origins from database:', error);
    // Continue with default origins if database query fails
  }
}

// Load origins on module initialization
loadAllowedOrigins();

// Optionally, refresh allowed origins every 5 minutes
setInterval(loadAllowedOrigins, 5 * 60 * 1000);

// Export function to manually refresh origins
export const refreshAllowedOrigins = loadAllowedOrigins;

const corsOptions = {
  origin: (origin: any, callback: (err: Error | null, success?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some((o) => (o instanceof RegExp ? o.test(origin) : false))) {
      callback(null, true); // Allow request
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, false); // Block request
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
};

export default cors(corsOptions);
