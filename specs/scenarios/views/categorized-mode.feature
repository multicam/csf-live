# Status: 0/6 scenarios passing
Feature: Categorized Mode
  Background:
    Given the app is loaded with mock data
    And the user is on the general feed at /feed

  Scenario: Categorized mode groups items by type
    When the user clicks the "Categorized" tab
    Then content items should be grouped by type
    And each group should have a header with a count badge

  Scenario: Each group shows correct count
    When the user clicks the "Categorized" tab
    Then the count in each group header should match the number of items in that group

  Scenario: Collapsing a group hides items count remains
    When the user clicks the "Categorized" tab
    And the user clicks a group header to collapse it
    Then the items in that group should be hidden
    And the count badge should still be visible

  Scenario: Expanding restores items
    Given a group is collapsed in Categorized mode
    When the user clicks the group header to expand it
    Then the items should become visible again

  Scenario: Switching back to Timeline has crossfade
    Given the user is in Categorized mode
    When the user clicks the "Timeline" tab
    Then the view should transition with a crossfade animation

  Scenario: Messages excluded from Categorized mode
    When the user clicks the "Categorized" tab
    Then message items should not appear in any category group
