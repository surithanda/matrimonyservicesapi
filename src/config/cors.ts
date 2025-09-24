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


const allowedOrigins = [
  'http://localhost:3000', 
   /^https:\/\/matrimonyservices-[a-zA-Z0-9]+-superreaders-projects\.vercel\.app$/,
  // 'https://matrimonyservices-47gn0w4ye-superreaders-projects.vercel.app',
  "https://matrimonyservices.vercel.app"
];

const corsOptions = {


  origin: (origin: any, callback: (err: Error | null, success?: boolean) =>  void) =>  {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some((o) => (o instanceof RegExp ? o.test(origin) : false))) {
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
