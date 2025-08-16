import cors from 'cors';

//const corsOptions = {
//  origin:const allowedOrigins = ['http://localhost:3000',
  //(origin: any, callback: (arg0: null, arg1: boolean) => void) => {
  //  callback(null, true); // Allow any origin dynamically
  //},
 // credentials: true,
 // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
 // allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
//};


const allowedOrigins = ['http://localhost:3000', 'https://your-production-site.com'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow request
    } else {
      callback(new Error('Not allowed by CORS')); // Block request
    }
  },
  credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
};

export default cors(corsOptions);
