# Status: 0/7 scenarios passing
Feature: Project Dashboard
  Background:
    Given the app is loaded with mock data
    And the user is on the CSF Live project at /feed/csf-live

  Scenario: No item selected project dashboard shown
    When no item is selected in the detail column
    Then the Project Dashboard should be shown in column 3

  Scenario: Dashboard shows title description sections activity
    Then the dashboard should show the project title
    And the project description
    And the sections list
    And recent activity items

  Scenario: JM edits project title inline
    When the user clicks the project title
    And types a new title
    And blurs the input
    Then the title should be updated

  Scenario: JM edits project description inline
    When the user clicks the project description
    And types a new description
    And blurs the textarea
    Then the description should be updated

  Scenario: JM changes project status
    When the user clicks the status badge
    And selects "Paused"
    Then the status badge should show "Paused"

  Scenario: Presence indicator shows when Ben is in the project
    Given Ben's presence location is "project:project-csf-live"
    When the user views the CSF Live project dashboard
    Then a presence indicator should show that Ben is in this project

  Scenario: Presence indicator absent for other projects
    When the user views a project other than CSF Live
    Then no presence indicator for Ben should be visible
