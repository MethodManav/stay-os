import { Types } from 'mongoose';
import { IBookingRepository } from '../../bookings/repositories/IBookingRepository';
import { IPaymentProvider } from '../interfaces/IPaymentProvider';
import { PaymentTransactionModel, IPaymentTransactionDocument } from '../models/PaymentTransactionModel';
import { NotFoundError } from '../../../core/errors/NotFoundError';
import { BadRequestError } from '../../../core/errors/BadRequestError';

export class PaymentService {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly stripeProvider: IPaymentProvider,
    private readonly razorpayProvider: IPaymentProvider
  ) {}

  public async processPayment(
    organizationId: string,
    businessId: string,
    bookingId: string,
    params: {
      amount: number;
      currency: string;
      provider: 'stripe' | 'razorpay';
      sourceToken?: string;
    }
  ): Promise<IPaymentTransactionDocument> {
    if (params.amount <= 0) {
      throw new BadRequestError('Payment amount must be greater than zero');
    }

    // 1. Resolve Booking record
    const booking = await this.bookingRepository.findById(organizationId, bookingId);
    if (!booking) {
      throw new NotFoundError('Associated booking record not found');
    }

    if (booking.bookingStatus === 'CANCELLED') {
      throw new BadRequestError('Cannot process payments for cancelled bookings');
    }

    // 2. Create pending transaction log record
    const transaction = new PaymentTransactionModel({
      organizationId: new Types.ObjectId(organizationId),
      businessId: new Types.ObjectId(businessId),
      bookingId: new Types.ObjectId(bookingId),
      amount: params.amount,
      currency: params.currency,
      provider: params.provider,
      status: 'PENDING'
    });
    await transaction.save();

    // 3. Select active Payment Provider
    const provider = params.provider === 'stripe' ? this.stripeProvider : this.razorpayProvider;

    // 4. Charge checkout authorization
    try {
      const chargeResult = await provider.charge({
        amount: params.amount,
        currency: params.currency,
        orderId: bookingId,
        sourceToken: params.sourceToken
      });

      if (chargeResult.success) {
        transaction.status = 'SUCCESS';
        transaction.providerTransactionId = chargeResult.transactionId;
        transaction.method = chargeResult.rawResponse.payment_method_details?.card?.brand || chargeResult.rawResponse.method || 'card';
        transaction.rawResponse = chargeResult.rawResponse;
        await transaction.save();

        // Update payment status on the Booking record
        await this.bookingRepository.update(organizationId, bookingId, {
          paymentStatus: 'PAID'
        });
      } else {
        transaction.status = 'FAILED';
        transaction.rawResponse = chargeResult.rawResponse;
        await transaction.save();

        await this.bookingRepository.update(organizationId, bookingId, {
          paymentStatus: 'FAILED'
        });
      }
    } catch (chargeErr: any) {
      transaction.status = 'FAILED';
      transaction.rawResponse = { error: chargeErr.message || 'Payment system error' };
      await transaction.save();

      await this.bookingRepository.update(organizationId, bookingId, {
        paymentStatus: 'FAILED'
      });
    }

    return transaction;
  }

  public async processRefund(
    organizationId: string,
    businessId: string,
    transactionId: string,
    amount: number
  ): Promise<IPaymentTransactionDocument> {
    if (amount <= 0) {
      throw new BadRequestError('Refund amount must be greater than zero');
    }

    // 1. Find the transaction
    const transaction = await PaymentTransactionModel.findOne({
      _id: new Types.ObjectId(transactionId),
      organizationId: new Types.ObjectId(organizationId),
      businessId: new Types.ObjectId(businessId),
      status: 'SUCCESS'
    }).exec();

    if (!transaction) {
      throw new NotFoundError('Successful payment transaction record not found');
    }

    if (amount > transaction.amount) {
      throw new BadRequestError('Refund amount cannot exceed the original transaction value');
    }

    const provider = transaction.provider === 'stripe' ? this.stripeProvider : this.razorpayProvider;
    
    // 2. Process refund on gateway
    const refundResult = await provider.refund(transaction.providerTransactionId || '', amount);

    if (refundResult.success) {
      // Create a separate refund transaction record
      const refundLog = new PaymentTransactionModel({
        organizationId: new Types.ObjectId(organizationId),
        businessId: new Types.ObjectId(businessId),
        bookingId: transaction.bookingId,
        amount: -amount, // Negative for refund entries
        currency: transaction.currency,
        provider: transaction.provider,
        providerTransactionId: refundResult.rawResponse.id,
        status: 'SUCCESS',
        method: transaction.method,
        rawResponse: refundResult.rawResponse
      });
      await refundLog.save();

      // Update Booking status to REFUNDED
      await this.bookingRepository.update(organizationId, transaction.bookingId.toString(), {
        paymentStatus: 'REFUNDED'
      });

      return refundLog;
    } else {
      throw new Error('Payment gateway declined the refund transaction');
    }
  }
}
export default PaymentService;
