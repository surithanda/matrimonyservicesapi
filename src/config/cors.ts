import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://frontend-domain.com',
    'https://matrimoney-backend.vercel.app',
    'https://cdnjs.cloudflare.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

export default cors(corsOptions); 