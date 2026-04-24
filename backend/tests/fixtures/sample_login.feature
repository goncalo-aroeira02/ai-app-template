@status-active
Feature: Login Flow
  As a user, I want to log in securely so that I can access my account.

  @status-in_progress
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter valid credentials
    Then I should be redirected to the dashboard

  @status-draft
  Scenario: Failed login with invalid password
    Given I am on the login page
    When I enter an invalid password
    Then I should see an error message
    And I should remain on the login page
