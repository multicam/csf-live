# Status: 0/6 scenarios passing
Feature: Keyboard shortcuts

  Background:
    Given JM is on the feed page

  Scenario: Cmd+K opens the app menu
    When JM presses Cmd+K
    Then the app menu dropdown is visible

  Scenario: Cmd+Shift+F opens search
    When JM presses Cmd+Shift+F
    Then the URL is /search and the search input is focused

  Scenario: Cmd+N opens quick capture in enhanced mode
    When JM presses Cmd+N
    Then the enhanced capture panel is visible

  Scenario: Cmd+backslash toggles the projects panel
    When JM presses Cmd+\
    Then the projects column is collapsed
    When JM presses Cmd+\ again
    Then the projects column is visible

  Scenario: Escape clears search input
    Given the search input has text "hello"
    When JM presses Escape
    Then the search input is cleared

  Scenario: Keyboard Shortcuts modal shows all shortcuts
    When JM opens the app menu
    And JM clicks "Keyboard Shortcuts"
    Then a modal appears listing Cmd+K, Cmd+N, Cmd+Shift+F, Cmd+\, Cmd+Enter, Escape
