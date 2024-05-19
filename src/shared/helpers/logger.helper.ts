import pino from 'pino'
import pretty from 'pino-pretty'

const stream = pretty({
  colorize: true
})

const logger = pino({
  enabled: true,
  level: 'info'
}, stream)

export { logger }
