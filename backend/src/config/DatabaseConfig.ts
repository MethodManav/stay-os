import { EnvConfig } from './EnvConfig';

export const DatabaseConfig = {
  uri: EnvConfig.MONGO_URI,
  options: {
    autoIndex: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  }
};
