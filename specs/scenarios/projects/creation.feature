# Status: 0/6 scenarios passing
Feature: Project Creation
  Background:
    Given the app is loaded with mock data

  Scenario: JM creates a project title only
    When the user clicks "New Project"
    And enters a project title
    And confirms
    Then the new project should appear in the Projects column

  Scenario: New project appears in Projects column
    Given a new project has been created
    Then it should be visible in the sorted project list

  Scenario: JM navigates to new project feed after creation
    When a new project is created
    Then the user should be navigated to /feed/{new-slug}

  Scenario: JM creates project with title and description
    When the user creates a project with both title and description
    Then the project dashboard should show the description

  Scenario: Slug auto-generated from title
    When the user creates a project titled "My New Project"
    Then the project slug should be "my-new-project"

  Scenario: Empty title shows validation error
    When the user opens the Create Project dialog
    And tries to confirm with an empty title
    Then a validation error should be shown
