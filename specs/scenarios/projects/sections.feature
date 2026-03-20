# Status: 0/6 scenarios passing
Feature: Project Sections
  Background:
    Given the app is loaded with mock data
    And the user is on the CSF Live project at /feed/csf-live

  Scenario: JM adds a section to a project
    When the user clicks "Add section" in the project dashboard
    And enters a section title
    And confirms
    Then the new section should appear in the section chips row

  Scenario: New section appears in section chips row
    Given a new section has been added to the project
    Then it should be visible as a chip in the section filter row

  Scenario: JM clicks section chip feed filters to that section
    When the user clicks a section chip
    Then the feed should show only items from that section
    And the URL should contain ?section={sectionId}

  Scenario: JM posts a message in a section discussion
    Given a section chip is selected
    When the user posts a message in the compose input
    Then the message should appear in the section discussion

  Scenario: Section message appears in project root with section label
    Given a message was posted in the Frontend Architecture section
    When the user views the project root feed (no section filter)
    Then the message should appear labeled "In Frontend Architecture"

  Scenario: Project root shows interleaved messages from all sections
    When the user views the project root feed
    Then messages from all sections should be interleaved chronologically
    And each section message should show its section label
