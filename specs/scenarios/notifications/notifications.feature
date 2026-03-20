# Status: 0/7 scenarios passing
Feature: Notifications
  Background:
    Given the app is loaded with mock data

  Scenario: App Menu shows unread count badge
    Then the App Menu button should show a red badge with the unread count

  Scenario: JM opens notification panel all notifications listed
    When the user opens the App Menu
    And clicks "Notifications"
    Then the notification panel should open
    And all notifications should be listed

  Scenario: Unread notifications have bold title
    When the notification panel is open
    Then unread notifications should have a bold title

  Scenario: JM clicks notification navigates to referenced content
    When the notification panel is open
    And the user clicks a notification
    Then the user should be navigated to the referenced content
    And the notification should be marked as read

  Scenario: Clicked notification marked as read
    When the user clicks a notification in the panel
    Then that notification's title should no longer be bold

  Scenario: JM marks all as read badge goes to zero
    When the notification panel is open
    And the user clicks "Mark all as read"
    Then the App Menu badge should disappear

  Scenario: You are all caught up empty state
    Given all notifications have been read
    When the notification panel is open
    Then the message "You're all caught up." should be visible
