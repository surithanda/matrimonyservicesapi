import cors from 'cors';

const corsOptions = {
  origin: (origin: any, callback: (arg0: null, arg1: boolean) => void) => {
    callback(null, true); // Allow any origin dynamically
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
};

export default cors(corsOptions);