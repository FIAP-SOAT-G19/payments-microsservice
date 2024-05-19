import { ProcessPaymentGateway } from '@/adapters/gateways/process-payment/process-payment.gateway'
import { CryptoAdapter } from '@/adapters/tools/crypto/crypto.adapter'
import { ProcessPaymentUseCase } from '@/usecases/process-payment/process-payment.usecase'
import schedule from 'node-schedule'

export const processPayments = async (): Promise<void> => {
  schedule.scheduleJob('*/1 * * * *', async () => {
    const processPaymentUseCase = new ProcessPaymentUseCase(new ProcessPaymentGateway(), new CryptoAdapter())
    await processPaymentUseCase.execute()
  })
}
