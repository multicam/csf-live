# Status: 0/5 scenarios passing
Feature: Presence
  Background:
    Given the app is loaded with mock data

  Scenario: App Menu shows JM and Ben as online
    When the user opens the App Menu
    Then the "Who's Online" section should show JM and Ben

  Scenario: Projects column presence list shows online users
    Then the presence list at the bottom of the Projects column should show online users

  Scenario: Ben is in this project on CSF Live project dashboard
    When the user navigates to the CSF Live project
    Then a presence indicator should show that Ben is present

  Scenario: Ben indicator absent on other projects
    When the user navigates to a project other than CSF Live
    Then no presence indicator for Ben should be visible

  Scenario: Presence is static in Tier 1
    Then the presence data should not update in real-time
