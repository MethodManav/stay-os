export interface PaymentChargeParams {
  amount: number;
  currency: string;
  orderId: string;
  sourceToken?: string;
  metadata?: Record<string, any>;
}

export interface PaymentChargeResult {
  success: boolean;
  transactionId: string;
  amountCharged: number;
  provider: 'stripe' | 'razorpay';
  rawResponse: any;
}

export interface IPaymentProvider {
  getProviderName(): 'stripe' | 'razorpay';
  charge(params: PaymentChargeParams): Promise<PaymentChargeResult>;
  refund(transactionId: string, amount: number): Promise<{ success: boolean; rawResponse: any }>;
}
