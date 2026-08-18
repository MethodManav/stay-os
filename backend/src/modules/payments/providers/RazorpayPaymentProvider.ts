import { IPaymentProvider, PaymentChargeParams, PaymentChargeResult } from '../interfaces/IPaymentProvider';
import crypto from 'crypto';

export class RazorpayPaymentProvider implements IPaymentProvider {
  public getProviderName(): 'stripe' | 'razorpay' {
    return 'razorpay';
  }

  public async charge(params: PaymentChargeParams): Promise<PaymentChargeResult> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (params.sourceToken === 'razorpay_failed' || params.amount === 999999) {
      return {
        success: false,
        transactionId: '',
        amountCharged: 0,
        provider: 'razorpay',
        rawResponse: { error: 'Payment authorization failed' }
      };
    }

    return {
      success: true,
      transactionId: `pay_razor_${crypto.randomBytes(12).toString('hex')}`,
      amountCharged: params.amount,
      provider: 'razorpay',
      rawResponse: {
        id: 'pay_mock',
        status: 'captured',
        method: 'netbanking',
        bank: 'SBI',
        email: 'guest@stayos.com'
      }
    };
  }

  public async refund(transactionId: string, amount: number): Promise<{ success: boolean; rawResponse: any }> {
    return {
      success: true,
      rawResponse: {
        id: `rfnd_razor_${crypto.randomBytes(12).toString('hex')}`,
        status: 'processed',
        amount: amount,
        payment_id: transactionId
      }
    };
  }
}
export default RazorpayPaymentProvider;
