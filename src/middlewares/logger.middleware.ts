import morgan from 'morgan';
import winston from 'winston';

const isDevelopment = process.env.NODE_ENV === 'development';

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.simple()
  })
];

if (isDevelopment) {
  transports.push(
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  );
}

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports
});

export const requestLogger = morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
});
