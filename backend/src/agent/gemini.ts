import { GoogleGenAI } from '@google/genai';
import { AppConfig } from '../config/AppConfig';
import { Logger } from '../shared/utils/Logger';

let geminiClientInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = AppConfig.gemini.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    Logger.warn('GEMINI_API_KEY is not set. The Gemini Agent will run in simulated concierge mode.');
    return null;
  }

  if (!geminiClientInstance) {
    geminiClientInstance = new GoogleGenAI({ apiKey });
  }

  return geminiClientInstance;
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
