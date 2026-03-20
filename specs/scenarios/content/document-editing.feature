# Status: 0/6 scenarios passing
Feature: Document Editing
  Background:
    Given the app is loaded with mock data
    And the user has selected a document content item

  Scenario: Clicking a document item opens TipTap editor in Detail column
    When the user clicks a document content item
    Then the TipTap editor should be visible in the Detail column

  Scenario: Toolbar buttons apply formatting
    Given the document editor is open
    When the user selects text and clicks the Bold button
    Then the selected text should be bold

  Scenario: Editing content triggers auto-save after 2s inactivity
    Given the document editor is open
    When the user types and stops for 2 seconds
    Then the document should be auto-saved

  Scenario: Auto-save creates a new version in version history
    Given the document editor has auto-saved
    When the user opens the version history panel
    Then a new version should be listed

  Scenario: document_type badge shown in editor header
    Given a document with type PRD is open
    Then the editor header should show a "PRD" badge

  Scenario: Switching to a different item discards unsaved draft
    Given the user is editing a document
    When the user selects a different item
    Then no draft content from the previous item should appear
