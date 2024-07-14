import { logger } from '@/shared/helpers/logger.helper'
import { AwsSqsAdapter } from './aws-sqs.adapter'
import { CreatedOrderHandler } from './handlers/created_order.handler'
import { CancelOrderHandler } from './handlers/cancel_order.handler'

export const processMessagesOnQueue = async (): Promise<void> => {
  while (true) {
    const queue = new AwsSqsAdapter()
    try {
      await Promise.all([
        processCreatedOrderQueue(queue),
        processCancelOrderQueue(queue)
      ])
    } catch (error) {
      logger.error(`Error processing queue message, ${error}`)
    }
  }
}

const processCreatedOrderQueue = async (queue: AwsSqsAdapter): Promise<any> => {
  const createdOrderQueueName = process.env.QUEUE_CREATED_ORDER!
  const maxNumberOfMessages = 1
  const waitTimeSeconds = 20

  const messages = await queue.receiveMessage(createdOrderQueueName, maxNumberOfMessages, waitTimeSeconds)

  if (!messages || messages.length === 0) {
    return null
  }

  for (const message of messages) {
    const handler = new CreatedOrderHandler()
    await handler.execute(JSON.parse(message.Body))
    await queue.deleteMessage(createdOrderQueueName, message.ReceiptHandle, message.MessageId)
  }
}

const processCancelOrderQueue = async (queue: AwsSqsAdapter): Promise<any> => {
  const cancelOrderQueueName = process.env.CANCEL_ORDER_QUEUE!
  const maxNumberOfMessages = 1
  const waitTimeSeconds = 20

  const messages = await queue.receiveMessage(cancelOrderQueueName, maxNumberOfMessages, waitTimeSeconds)

  if (!messages || messages.length === 0) {
    return null
  }

  for (const message of messages) {
    const handler = new CancelOrderHandler()
    await handler.execute(JSON.parse(message.Body))
    await queue.deleteMessage(cancelOrderQueueName, message.ReceiptHandle, message.MessageId)
  }
}
