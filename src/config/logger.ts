import winston from 'winston';
import path from 'path';

// Only write to file in development — serverless environments (Vercel, Lambda)
// have a read-only filesystem and will crash if a File transport is used.
const isDevelopment = process.env.NODE_ENV === 'development';

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

if (isDevelopment) {
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'app.log')
    })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'account-service' },
  transports
});

export default logger;
