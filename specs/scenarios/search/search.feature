# Status: 0/10 scenarios passing
Feature: Search
  Background:
    Given the app is loaded with mock data

  Scenario: JM opens search from App Menu
    When the user opens the App Menu
    And clicks "Search"
    Then the user should be navigated to /search
    And the search input should be focused

  Scenario: JM opens search via Cmd+Shift+F
    When the user presses Cmd+Shift+F
    Then the user should be navigated to /search

  Scenario: JM types query — results within 300ms client-side
    Given the user is on /search
    When the user types "auth" in the search bar
    Then search results should appear within 300ms
    And the results should contain items matching "auth"

  Scenario: Results show type icon preview project author date
    Given the user has searched for "auth"
    Then each result should show a type icon
    And each result should show the item author
    And each result should show the creation date

  Scenario: JM clicks result navigates to item in context
    Given the user has search results for "auth"
    When the user clicks on a search result
    Then the user should be navigated to the item's detail view

  Scenario: Type filter narrows results
    Given the user is on /search with results
    When the user applies a "document" type filter
    Then only document type results should be shown

  Scenario: Author filter narrows results
    Given the user is on /search with results
    When the user applies a "Claude" author filter
    Then only results authored by Claude should be shown

  Scenario: Clearing filters restores full results
    Given the user has applied filters on the search page
    When the user removes all filters
    Then all matching results should be shown again

  Scenario: Empty query returns no results
    Given the user is on /search
    When the search input is empty
    Then no results should be shown
    And the empty search prompt should be visible

  Scenario: No matches shows empty state
    Given the user is on /search
    When the user types "xyznonexistentterm123" in the search bar
    Then the "No results found" empty state should be shown
