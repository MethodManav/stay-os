import { IPaymentProvider, PaymentChargeParams, PaymentChargeResult } from '../interfaces/IPaymentProvider';
import crypto from 'crypto';

export class StripePaymentProvider implements IPaymentProvider {
  public getProviderName(): 'stripe' | 'razorpay' {
    return 'stripe';
  }

  public async charge(params: PaymentChargeParams): Promise<PaymentChargeResult> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (params.sourceToken === 'tok_chargeDeclined' || params.amount === 999999) {
      return {
        success: false,
        transactionId: '',
        amountCharged: 0,
        provider: 'stripe',
        rawResponse: { error: 'Card declined by issuing bank' }
      };
    }

    return {
      success: true,
      transactionId: `ch_stripe_${crypto.randomBytes(12).toString('hex')}`,
      amountCharged: params.amount,
      provider: 'stripe',
      rawResponse: {
        id: 'ch_mock',
        status: 'succeeded',
        billing_details: { email: 'guest@stayos.com' },
        payment_method_details: { card: { brand: 'visa', last4: '4242' } }
      }
    };
  }

  public async refund(transactionId: string, amount: number): Promise<{ success: boolean; rawResponse: any }> {
    return {
      success: true,
      rawResponse: {
        id: `re_stripe_${crypto.randomBytes(12).toString('hex')}`,
        status: 'succeeded',
        amount_refunded: amount,
        charge: transactionId
      }
    };
  }
}
export default StripePaymentProvider;
