# Status: 0/8 scenarios passing
Feature: Content Movement
  Background:
    Given the app is loaded with mock data
    And the user is on the general feed at /feed

  Scenario: JM moves a feed item to a project via Move to
    Given a content item is in the general feed
    When the user right-clicks the item and selects "Move to..."
    And selects a project in the Move dialog
    And confirms the move
    Then the item should be associated with that project

  Scenario: Moved item disappears from general feed
    Given a content item is in the general feed
    When the item is moved to a project
    Then the item should no longer appear in the general feed

  Scenario: Moved item appears in target project feed
    Given a content item has been moved to a project
    When the user navigates to that project
    Then the item should appear in the project feed

  Scenario: JM copies a feed item original remains
    Given a content item is in the general feed
    When the user right-clicks and selects "Copy to..."
    And selects a project in the Copy dialog
    And confirms the copy
    Then the original item should remain in the general feed
    And a copy should exist in the target project

  Scenario: JM unassigns an item from a project back to the feed
    Given a content item is in a project
    When the user right-clicks and selects "Unassign"
    Then the item should be removed from the project
    And appear in the general feed

  Scenario: JM drag-and-drops a feed item onto a project
    Given a content item is in the general feed
    When the user drags the item onto a project card
    Then the item should be moved to that project

  Scenario: Move to project with section targeting
    Given the Move dialog is open
    When the user selects a project and a specific section
    And confirms
    Then the item should be assigned to that section

  Scenario: Move dialog dismissed without action item unchanged
    Given the Move dialog is open
    When the user clicks Cancel
    Then the item should remain unchanged
