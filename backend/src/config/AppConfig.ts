import { EnvConfig } from './EnvConfig';

export const AppConfig = {
  env: EnvConfig.NODE_ENV,
  port: EnvConfig.PORT,
  clientUrl: EnvConfig.CLIENT_URL,
  isProduction: EnvConfig.NODE_ENV === 'production',
  isTest: EnvConfig.NODE_ENV === 'test',
  isDevelopment: EnvConfig.NODE_ENV === 'development',
  jwt: {
    accessSecret: EnvConfig.JWT_ACCESS_SECRET,
    refreshSecret: EnvConfig.JWT_REFRESH_SECRET,
    accessExpiresIn: EnvConfig.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: EnvConfig.JWT_REFRESH_EXPIRES_IN
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
};
