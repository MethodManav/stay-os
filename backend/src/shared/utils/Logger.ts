import winston from 'winston';
import { AppConfig } from '../../config/AppConfig';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// Custom format to mask sensitive fields
const maskSensitiveFields = winston.format((info: any) => {
  const sensitiveKeys = ['password', 'token', 'secret', 'jwt', 'authorization', 'card', 'cvv'];
  
  if (info.metadata && typeof info.metadata === 'object') {
    const serialized = JSON.stringify(info.metadata);
    let maskedStr = serialized;
    for (const key of sensitiveKeys) {
      const regex = new RegExp(`("${key}"\\s*:\\s*")[^"]+(")`, 'gi');
      maskedStr = maskedStr.replace(regex, `$1[MASKED]$2`);
    }
    info.metadata = JSON.parse(maskedStr);
  }
  
  if (typeof info.message === 'string') {
    for (const key of sensitiveKeys) {
      const regex = new RegExp(`(${key}=)[^\\s&]+`, 'gi');
      info.message = info.message.replace(regex, `$1[MASKED]`);
    }
  }
  
  return info;
});

const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  maskSensitiveFields(),
  winston.format.printf(({ timestamp, level, message, metadata }: any) => {
    const metaStr = metadata && Object.keys(metadata).length ? ` | meta: ${JSON.stringify(metadata)}` : '';
    return `[${timestamp}] [${level}]: ${message}${metaStr}`;
  })
);

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  maskSensitiveFields(),
  winston.format.json()
);

export const Logger = winston.createLogger({
  level: AppConfig.isDevelopment ? 'debug' : 'info',
  levels,
  format: AppConfig.isDevelopment ? developmentFormat : productionFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10
    })
  ]
});
