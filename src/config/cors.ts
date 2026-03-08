import cors, { CorsOptionsDelegate } from 'cors';
import { Request } from 'express';
import pool from '../config/database';

const DEFAULT_ORIGINS: (string | RegExp)[] = [
  'http://localhost:3000',
];

let allowedOrigins: (string | RegExp)[] = [...DEFAULT_ORIGINS];

// Tracks the in-flight DB load so multiple simultaneous cold-start
// requests all await the same promise instead of firing parallel queries.
let loadPromise: Promise<void> | null = null;
let lastLoadedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // re-fetch every 5 minutes

async function loadAllowedOrigins(): Promise<void> {
  try {
    const [results] = await pool.execute(`CALL api_clients_get_all()`) as any;
    const rows = results[0];

    // Sanitize: strip trailing slashes and remove null/empty values
    const dbDomains: string[] = rows
      .map((row: any) => row.partner_root_domain?.trim().replace(/\/+$/, ''))
      .filter((d: any) => !!d);

    const stringDefaults = DEFAULT_ORIGINS.filter(o => typeof o === 'string') as string[];
    const regexDefaults = DEFAULT_ORIGINS.filter(o => o instanceof RegExp);
    const uniqueDomains = [...new Set([...stringDefaults, ...dbDomains])];

    allowedOrigins = [...uniqueDomains, ...regexDefaults];
    lastLoadedAt = Date.now();

    console.log('Loaded allowed origins from database:', allowedOrigins);
  } catch (error) {
    console.error('Error loading allowed origins from database:', error);
    // Keep existing origins on failure
  } finally {
    loadPromise = null;
  }
}

function ensureOriginsLoaded(): Promise<void> {
  const isStale = Date.now() - lastLoadedAt > CACHE_TTL_MS;
  if (isStale && !loadPromise) {
    loadPromise = loadAllowedOrigins();
  }
  // Return the in-flight promise (so cold-start callers all await the same query)
  // or an already-resolved promise if origins are fresh.
  return loadPromise ?? Promise.resolve();
}

// Export function to manually refresh origins
export const refreshAllowedOrigins = loadAllowedOrigins;

const corsDelegate: CorsOptionsDelegate<Request> = async (req, callback) => {
  // Guarantee DB origins are loaded before checking — safe on cold starts
  await ensureOriginsLoaded();

  const origin = req.headers.origin;
  const isAllowed =
    !origin ||
    allowedOrigins.some(o =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );

  if (!isAllowed) {
    console.log('CORS blocked origin:', origin);
  }

  callback(null, {
    origin: isAllowed,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  });
};

export default cors(corsDelegate);
