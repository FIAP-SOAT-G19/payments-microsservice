import '../shared/config/module-alias'
import express from 'express'
import cors from 'cors'
import { logger } from '@/shared/helpers/logger.helper'
import { processMessagesOnQueue } from '@/adapters/queue/aws-sqs-poller.adapter'

const start = async (): Promise<void> => {
  const app = express()

  app.use(cors())
  app.use(express.json())

  const port = process.env.PORT ?? 3000

  app.listen(port, () => { logger.info(`Server running at port ${port}`) })

  await processMessagesOnQueue()
}

void start()
