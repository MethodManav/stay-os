import mongoose from 'mongoose';
import { DatabaseConfig } from '../../config/DatabaseConfig';
import { Logger } from '../../shared/utils/Logger';

export class MongoDatabase {
  private static isConnected = false;

  public static async connect(): Promise<void> {
    if (this.isConnected) {
      Logger.warn('Database is already connected.');
      return;
    }

    try {
      mongoose.connection.on('connected', () => {
        Logger.info('MongoDB database connection established successfully.');
        this.isConnected = true;
      });

      mongoose.connection.on('error', (err) => {
        Logger.error(`MongoDB connection error: ${err.message}`, { error: err });
      });

      mongoose.connection.on('disconnected', () => {
        Logger.warn('MongoDB connection disconnected.');
        this.isConnected = false;
      });

      await mongoose.connect(DatabaseConfig.uri, DatabaseConfig.options);
    } catch (error) {
      Logger.error('Failed to connect to MongoDB', { error });
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      Logger.info('MongoDB database connection closed.');
    } catch (error) {
      Logger.error('Failed to close MongoDB connection', { error });
      throw error;
    }
  }
}
