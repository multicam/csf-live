# Status: 0/6 scenarios passing
Feature: Messaging
  Background:
    Given the app is loaded with mock data

  Scenario: JM posts in a project discussion
    Given the user is on the CSF Live project feed
    When the user types a message in the compose input and submits
    Then the message should appear in the project feed

  Scenario: JM posts in a section discussion
    Given the user is viewing a section in the CSF Live project
    When the user types a message and submits
    Then the message should appear in the section feed

  Scenario: Section message appears labeled in project root discussion
    Given a message was posted in a section
    When the user views the project root feed
    Then the message should appear with a section label

  Scenario: Markdown rendering bold code block
    Given a message containing markdown in the feed
    Then bold text should render as bold
    And code blocks should be styled as code

  Scenario: Message shows correct author
    Given messages from different authors in the feed
    Then each message should show the correct author name and avatar

  Scenario: Claude messages have distinct styling
    Given a message from Claude in the feed
    Then it should have the Claude author badge
    And distinct visual styling
