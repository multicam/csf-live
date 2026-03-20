# Status: 0/7 scenarios passing
Feature: Canvas Versioning
  Background:
    Given the app is loaded with mock data
    And the user is on the canvas at /

  Scenario: Canvas save creates a new version entry
    When the user saves the canvas
    Then a new version should be recorded

  Scenario: Version history lists all saved versions
    Given the canvas has been saved multiple times
    When the user views the version history
    Then all versions should be listed with author and timestamp

  Scenario: Viewing older version shows that content read-only
    When the user clicks an older version in the history
    Then the canvas content from that version should be shown
    And the canvas should be in read-only view mode

  Scenario: Restore button present but disabled with Phase 2 tooltip
    When the user views version history
    Then a "Restore" button should be visible
    And it should be disabled
    And hovering should show "Version restore available in Phase 2"

  Scenario: Newer localStorage draft triggers recovery banner on load
    Given a newer draft exists in localStorage
    When the user navigates to /
    Then a draft recovery banner should appear

  Scenario: JM accepts draft recovery canvas loads draft
    Given the draft recovery banner is shown
    When the user clicks "Recover draft"
    Then the canvas should load the draft content

  Scenario: JM dismisses draft recovery canvas loads last saved version
    Given the draft recovery banner is shown
    When the user clicks "Dismiss"
    Then the canvas should load the last saved version
