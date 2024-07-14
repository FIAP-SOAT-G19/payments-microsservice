export default {
  PAYMENT_STATUS: {
    APPROVED: 'approved',
    PROCESSING: 'processing',
    REFUSED: 'refused',
    WAITING: 'waiting',
    REVERSED: 'reversed'
  },
  MESSAGE_GROUP_ID: 'processed_payment',
  CARD_ENCRYPTOR_MICROSSERVICE: {
    URL: process.env.CARD_ENCRYPTOR_MICROSSERVICE_URL!
  }
}
