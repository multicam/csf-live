# Status: 0/5 scenarios passing
Feature: Version History
  Background:
    Given the app is loaded with mock data
    And the user has selected a document with version history

  Scenario: Version history panel lists all versions
    When the user clicks the version history button
    Then all versions should be listed

  Scenario: Clicking version loads read-only preview
    When the user clicks a version in the history panel
    Then the content of that version should be displayed
    And the editor should be in read-only mode

  Scenario: Restore button disabled with Phase 2 tooltip
    When the version history panel is open
    Then the Restore button should be disabled
    And hovering should show "Version restore available in Phase 2"

  Scenario: Each version shows author timestamp change summary
    When the version history panel is open
    Then each version should show the author name
    And the creation timestamp
    And the change summary if available

  Scenario: Editing document creates new version on auto-save
    Given the document editor is open
    When the user edits the document and waits 2 seconds
    Then a new version should appear in the version history
