# Status: 0/6 scenarios passing
Feature: Feed posting

  Background:
    Given the app is loaded
    And the user is Jean-Marc (user-jm)

  Scenario: JM posts a text message to the general feed
    Given I am on /feed
    When I type "Hello world" in the compose input
    And I click the send button
    Then the message "Hello world" appears in the feed

  Scenario: Post fails with empty message content
    Given I am on /feed
    When I click the send button with empty input
    Then no message is added to the feed

  Scenario: JM posts a message containing a URL
    Given I am on /feed
    When I type "https://example.com" in the compose input
    And I click the send button
    Then a link card for "example.com" appears in the feed

  Scenario: JM posts using Cmd+Enter
    Given I am on /feed
    When I type "Quick message" in the compose input
    And I press Cmd+Enter
    Then the message "Quick message" appears in the feed

  Scenario: Feed shows correct author on JM's message
    Given I am on /feed
    When I post a message
    Then the message appears on the right side with my styling

  Scenario: Feed shows Claude's response with Claude author styling
    Given there are messages from user-claude in the feed
    When I view the feed
    Then Claude's messages show the AI badge and violet styling
