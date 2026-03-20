# Status: 0/4 scenarios passing
Feature: Drawing in Detail Column
  Background:
    Given the app is loaded with mock data
    And the user is viewing a feed with drawing items

  Scenario: Clicking a drawing content item opens tldraw in Detail column
    When the user clicks a drawing content item
    Then the tldraw editor should open in the Detail column

  Scenario: JM edits drawing in Detail and saves new version created
    Given a drawing is open in the Detail column
    When the user makes changes and clicks Save
    Then a new version should be recorded in the version history

  Scenario: Drawing version history panel lists previous versions
    Given a drawing has been saved multiple times
    When the user opens the version history panel
    Then all versions should be listed

  Scenario: Version restore disabled in Tier 1
    When the user views drawing version history
    Then the Restore button should be disabled
