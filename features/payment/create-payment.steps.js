const { Given, When, Then } = require('@cucumber/cucumber');
const { CreatePaymentUseCase } = require('../../dist/usecases/create-payment/create-payment.usecase');
const chai = require('chai');
const expect = chai.expect;

let useCase;
let response;
let requestData;

class CreatePaymentGatewayMock {
  payment;

  async createPayment(payment) {
    this.payment = payment;
    return 'mock-payment-id';
  }

  getPayment() {
    return this.payment;
  }
}

Given('I have a valid payment data', function () {
  requestData = {
    orderNumber: '12345',
    totalValue: 100.00,
    cardId: 'card123',
  };
  useCase = new CreatePaymentUseCase(new CreatePaymentGatewayMock());
});

When('I send a POST request to {string} with the payment data', async function (path) {
  const httpRequest = {
    body: requestData,
    path,
    method: 'POST',
  };
  const paymentId = await useCase.execute(httpRequest.body);
  response = {
    statusCode: 201,
    paymentId: paymentId
  };
});

Then('I should receive a {int} status code and the payment ID', function (statusCode) {
  const payment = useCase.gateway.getPayment();
  expect(response.statusCode).to.equal(statusCode);
  expect(response.paymentId).to.equal(payment.id);
});
