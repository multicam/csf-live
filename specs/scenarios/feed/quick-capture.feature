# Status: 0/10 scenarios passing
Feature: Quick Capture
  Background:
    Given the app is loaded with mock data
    And the user is on the general feed at /feed

  Scenario: JM opens Quick Capture via plus button
    When the user clicks the + button in the compose area
    Then the enhanced capture mode should open

  Scenario: JM opens Quick Capture via Cmd+N
    When the user presses Cmd+N
    Then the enhanced capture mode should open

  Scenario: JM captures a plain idea to the general feed
    When the user types an idea in the compose input
    And submits
    Then an idea content item should appear in the general feed

  Scenario: JM captures a link link card with pre-populated metadata
    When the user types a URL in the compose input
    And submits
    Then a link card should appear with title description and domain

  Scenario: JM captures targeted to a specific project not in general feed
    Given the enhanced capture mode is open
    When the user selects a project as the target
    And submits
    Then the item should appear in that project's feed
    And not in the general feed

  Scenario: JM captures targeted to a project section
    Given the enhanced capture mode is open
    When the user selects a project and a section as the target
    And submits
    Then the item should appear under that section

  Scenario: JM records voice audio player appears in feed
    Given the enhanced capture mode is open
    When the user holds the voice button and releases
    Then a voice content item should appear with an audio player

  Scenario: JM uploads a photo thumbnail appears
    Given the enhanced capture mode is open
    When the user selects a photo file
    Then a photo content item should appear with a thumbnail

  Scenario: JM captures a file file card with metadata
    Given the enhanced capture mode is open
    When the user selects a file
    Then a file content item should appear with filename size and type

  Scenario: JM posts in project feed goes to project discussion
    Given the user is in the CSF Live project feed
    When the user submits a message via the compose input
    Then the message should appear in the project discussion
