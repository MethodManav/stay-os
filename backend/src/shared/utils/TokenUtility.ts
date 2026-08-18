import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppConfig } from '../../config/AppConfig';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  organizations: { organizationId: string; role: string }[];
}

export class TokenUtility {
  public static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, AppConfig.jwt.accessSecret, {
      expiresIn: AppConfig.jwt.accessExpiresIn as any
    });
  }

  public static generateRefreshToken(userId: string): string {
    const jti = crypto.randomUUID();
    return jwt.sign({ userId, jti }, AppConfig.jwt.refreshSecret, {
      expiresIn: AppConfig.jwt.refreshExpiresIn as any
    });
  }

  public static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, AppConfig.jwt.accessSecret) as TokenPayload;
  }

  public static verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, AppConfig.jwt.refreshSecret) as { userId: string };
  }
}
export default TokenUtility;
