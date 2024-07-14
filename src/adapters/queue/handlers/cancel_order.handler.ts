import { ProcessPaymentGateway } from '@/adapters/gateways/process-payment/process-payment.gateway'
import { ReversalPaymentUseCase } from '@/usecases/reversal-payment/reversal-payment.usecase'
import { CryptoAdapter } from '@/adapters/tools/crypto/crypto.adapter'

export class CancelOrderHandler {
  async execute (message: any): Promise<void> {
    const { orderNumber } = message

    await this.reversalPayment(orderNumber)
  }

  async reversalPayment (orderNumber: string): Promise<void> {
    const processPaymentGateway = new ProcessPaymentGateway()
    const cryptoAdapter = new CryptoAdapter()
    const reversalPaymentUseCase = new ReversalPaymentUseCase(processPaymentGateway, cryptoAdapter)
    await reversalPaymentUseCase.execute(orderNumber)
  }
}
