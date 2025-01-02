import cors from 'cors';

const corsOptions = {
  origin: ['http://localhost:3000', 'https://frontend-domain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

export default cors(corsOptions); 