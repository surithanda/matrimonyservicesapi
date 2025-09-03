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


const allowedOrigins = ['http://localhost:3000', 'https://matrimonyservices-fm8tfyoyn-superreaders-projects.vercel.app'];

const corsOptions = {


  origin: (origin: any, callback: (err: Error | null, success?: boolean) =>  void) =>  {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow request
    } else {
      callback(null, false); // Block request
    }
  },
  credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
};

export default cors(corsOptions);
