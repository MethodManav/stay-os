import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      const result = await this.authService.register(name, email, password);
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.status(200).json({
        success: true,
        data: result,
        message: 'User logged in successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refresh(refreshToken);
      res.status(200).json({
        success: true,
        data: tokens,
        message: 'Tokens refreshed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      await this.authService.logout(refreshToken);
      res.status(200).json({
        success: true,
        message: 'User logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context not established');
      }
      await this.authService.changePassword(userId, oldPassword, newPassword);
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public registerOnboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        userName,
        email,
        password,
        orgName,
        orgSlug,
        businessName,
        businessType,
        businessPhone,
        businessAddress,
        businessCity,
        businessCountry,
        currency,
        timezone
      } = req.body;

      const result = await this.authService.registerAndOnboard({
        userName,
        email,
        passwordHash: password,
        orgName,
        orgSlug,
        businessName,
        businessType,
        businessPhone,
        businessAddress,
        businessCity,
        businessCountry,
        currency,
        timezone
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Account and organization onboarded successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
export default AuthController;
