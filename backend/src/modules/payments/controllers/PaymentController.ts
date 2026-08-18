import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/PaymentService';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  public charge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const { bookingId, amount, currency, provider, sourceToken } = req.body;

      const transaction = await this.paymentService.processPayment(orgId, businessId, bookingId, {
        amount,
        currency,
        provider,
        sourceToken
      });

      res.status(200).json({
        success: transaction.status === 'SUCCESS',
        data: transaction,
        message: transaction.status === 'SUCCESS' ? 'Payment processed successfully' : 'Payment transaction failed'
      });
    } catch (error) {
      next(error);
    }
  };

  public refund = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const { transactionId, amount } = req.body;

      const transaction = await this.paymentService.processRefund(orgId, businessId, transactionId, amount);

      res.status(200).json({
        success: true,
        data: transaction,
        message: 'Refund transaction processed successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
export default PaymentController;
