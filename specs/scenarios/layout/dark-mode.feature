# Status: 0/5 scenarios passing
Feature: Dark Mode
  Background:
    Given the app is loaded

  Scenario: Default theme respects system preference
    Given the system prefers dark mode
    Then the app should display in dark mode by default

  Scenario: Toggle dark mode from App Menu
    When the user opens the App Menu
    And clicks the theme toggle
    Then the app should switch to the next theme mode

  Scenario: Dark mode persists across page reload
    Given dark mode is active
    When the page is reloaded
    Then dark mode should still be active

  Scenario: tldraw respects dark mode
    Given dark mode is active
    When the user navigates to the canvas at /
    Then the tldraw canvas should be in dark mode

  Scenario: All components render correctly in dark mode
    Given dark mode is active
    Then all major UI components should have appropriate dark styling
