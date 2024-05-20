import { ProcessPaymentOutput } from '@/usecases/process-payment/process-payment.usecase.interface'
import { CreatePublishedMessageLog, CreditCard, PaymentOutput, ProcessPaymentGatewayInterface } from './process-payment.gateway.interface'
import { prismaClient } from '../prisma.client'
import { AwsSqsAdapter } from '@/adapters/queue/aws-sqs.adapter'
import { NodeFetchAdapter } from '@/adapters/tools/http/node-fetch.adapter'
import constants from '@/shared/constants'

export class ProcessPaymentGateway implements ProcessPaymentGatewayInterface {
  async getPaymentByStatus (status: string): Promise<PaymentOutput[] | null> {
    const output: PaymentOutput[] = []
    const payments = await prismaClient.payment.findMany({
      where: { status },
      select: {
        id: true,
        orderNumber: true,
        totalValue: true,
        status: true,
        reason: true,
        cardId: true,
        PaymentProducts: {
          select: {
            name: true,
            category: true,
            description: true,
            price: true,
            amount: true
          }
        },
        PaymentClient: {
          select: {
            id: true,
            identifier: true,
            name: true,
            cpf: true,
            email: true
          }
        }
      }
    })

    if (!payments?.length) {
      return null
    }

    for (let i = 0; i < payments.length; i++) {
      output.push({
        payment: {
          id: payments[i].id,
          orderNumber: payments[i].orderNumber,
          totalValue: payments[i].totalValue,
          status: payments[i].status,
          reason: payments[i].reason ?? '',
          cardId: payments[i].cardId
        },
        products: payments[i].PaymentProducts.map((product: any) => ({
          name: product.name,
          category: product.category,
          description: product.description,
          price: product.price,
          amount: product.amount
        })),
        client: {
          id: payments[i].PaymentClient?.id ?? '',
          name: payments[i].PaymentClient?.name ?? '',
          email: payments[i].PaymentClient?.email ?? '',
          cpf: payments[i].PaymentClient?.cpf ?? '',
          identifier: payments[i].PaymentClient?.identifier ?? ''
        }
      })
    }

    return output
  }

  async updatePaymentStatus (id: string, status: string): Promise<void> {
    await prismaClient.payment.update({ data: { status }, where: { id } })
  }

  async getCardData (cardId: string): Promise<string> {
    const http = new NodeFetchAdapter()

    const url = `${constants.CARD_ENCRYPTOR_MICROSSERVICE.URL}/card/${cardId}`
    const headers = {
      'Content-Type': 'application/json',
      appid: process.env.APP_ID,
      secretkey: process.env.SECRET_KEY
    }

    const response = await http.get(url, headers).then(function(response) {
      console.log(response)
      return JSON.parse(response)
    })
    return response
  }

  async deleteCardData (cardId: string): Promise<void> {
    const http = new NodeFetchAdapter()

    const url = `${constants.CARD_ENCRYPTOR_MICROSSERVICE.URL}/card/${cardId}`
    const headers = {
      'Content-Type': 'application/json',
      appid: process.env.APP_ID,
      secretkey: process.env.SECRET_KEY
    }

    await http.delete(url, headers)
  }

  async processExternalPayment (creditCard: CreditCard, totalValue: number): Promise<ProcessPaymentOutput> {
    const isEvenNumber = (+creditCard.number.slice(-1)) % 2 === 0

    const status = isEvenNumber ? 'approved' : 'refused'
    const reason = isEvenNumber ? undefined : this.getRandomMessage()

    return { status, reason }
  }

  getRandomMessage(): string {
    const messages = [
      'Saldo insuficiente',
      'Cartão bloqueado',
      'Cartão expirado',
      'Cartão inválido',
      'Número de parcelas ultrapassa o permitido',
      'Código de segurança inválido',
      'Venda não autorizada. Contate o emissor do seu cartão',
      'Transação negada - Venda não autorizada',
      'Cartão vencido ou data de vencimento incorreta'
    ]

    const randomIndex = Math.floor(Math.random() * messages.length)

    return messages[randomIndex]
  }

  async sendMessageQueue (queueName: string, body: string, messageGroupId: string, messageDeduplicationId: string): Promise<boolean> {
    const queue = new AwsSqsAdapter()
    return await queue.sendMessage(queueName, body, messageGroupId, messageDeduplicationId)
  }

  async createPublishedMessageLog (data: CreatePublishedMessageLog): Promise<void> {
    await prismaClient.publishedMessages.create({ data })
  }
}
