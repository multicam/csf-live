# Status: 0/6 scenarios passing
Feature: Responsive Layout
  Background:
    Given the app is loaded with mock data

  Scenario: Mobile 4-tab bottom nav shown
    Given the viewport is mobile width (375px)
    Then a 4-tab bottom navigation bar should be visible

  Scenario: Mobile default tab is Feed
    Given the viewport is mobile width
    Then the Feed tab should be active by default

  Scenario: Mobile Detail tab only after item selected
    Given the viewport is mobile width
    And no item is selected
    Then the Detail tab should be visually disabled

  Scenario: Tablet Projects column collapsible
    Given the viewport is tablet width (800px)
    When the user presses Cmd+backslash
    Then the Projects column should collapse to icon width

  Scenario: Desktop all 3 columns visible
    Given the viewport is desktop width (1200px)
    Then all 3 columns should be visible

  Scenario: Column widths persist across page reload
    Given the user has resized column 1
    When the page is reloaded
    Then column 1 should have the same width as before
