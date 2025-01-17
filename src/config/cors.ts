import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://frontend-domain.com',
    'https://matrimoney-backend.vercel.app',
    'https://cdnjs.cloudflare.com',
    'https://chaturvarnam.vercel.app',
    'https://charming-hoover.65-254-80-213.plesk.page'
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

export default cors(corsOptions); 