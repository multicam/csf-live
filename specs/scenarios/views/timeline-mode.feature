# Status: 0/7 scenarios passing
Feature: Timeline Mode
  Background:
    Given the app is loaded with mock data
    And the user is on the general feed at /feed

  Scenario: Feed defaults to Timeline mode
    Then the Timeline tab should be selected
    And feed items should be displayed in chronological order

  Scenario: Sort order toggle reverses feed
    When the user clicks the sort toggle
    Then feed items should be in descending chronological order
    When the user clicks the sort toggle again
    Then feed items should be in ascending chronological order

  Scenario: Content type filter shows only matching types
    Given the filter bar is open
    When the user selects "idea" as a content type filter
    Then only idea content items and messages should be visible
    And a filter chip "Type: Idea" should be shown

  Scenario: Author filter shows only that author's items
    Given the filter bar is open
    When the user selects "Claude" as the author filter
    Then only items authored by Claude should be visible

  Scenario: Date range filter hides out-of-range items
    Given the filter bar is open
    When the user selects "Last 7 days" as the date range
    Then only items from the last 7 days should be visible

  Scenario: Applied filters shown as dismissible chips
    Given the filter bar is open
    When the user applies a content type filter
    Then a dismissible filter chip should appear below the filter bar

  Scenario: Removing filter chip restores items
    Given a content type filter chip is active
    When the user clicks the × on the filter chip
    Then the filter should be removed
    And all item types should be visible again
