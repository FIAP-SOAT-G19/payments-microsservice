Feature: Create Payment
  As a user
  I want to create a new payment
  So that the payment can be added to the system

  Scenario: Successfully create a new payment
    Given I have a valid payment data
    When I send a POST request to "/payment" with the payment data
    Then I should receive a 201 status code and the payment ID
