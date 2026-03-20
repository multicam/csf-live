# Status: 0/9 scenarios passing
Feature: Canvas Drawing
  Background:
    Given the app is loaded with mock data

  Scenario: slash shows full-screen tldraw canvas
    When the user navigates to /
    Then a full-screen tldraw canvas should be visible

  Scenario: Canvas shows project nodes for all projects
    When the user is on the canvas at /
    Then project node shapes should be visible for each project

  Scenario: Clicking project node navigates to project feed
    When the user clicks a project node on the canvas
    Then the user should be navigated to /feed/{project-slug}

  Scenario: Clicking Feed node navigates to /feed
    When the user clicks the Feed node on the canvas
    Then the user should be navigated to /feed

  Scenario: JM draws a shape on the canvas
    When the user draws a shape on the tldraw canvas
    Then the shape should be visible on the canvas

  Scenario: JM saves canvas drawing item appears in general feed
    When the user clicks the Save button on the canvas
    And selects "General Feed" as target
    Then a drawing content item should appear in the general feed

  Scenario: JM saves canvas targeted to a project
    When the user clicks the Save button
    And selects a project as the target
    Then the drawing should appear in that project's feed

  Scenario: JM saves and closes drawing item created canvas cleared
    When the user clicks "Save and Close"
    Then a drawing content item should be created
    And the canvas should be reset to blank

  Scenario: Canvas is blank on next visit after save-and-close
    Given the user saved and closed the canvas
    When the user navigates back to /
    Then the canvas should be empty
