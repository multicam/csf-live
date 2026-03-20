# Status: 0/9 scenarios passing
Feature: Content Cards
  Background:
    Given the app is loaded with mock data
    And the user is on the general feed at /feed

  Scenario: Idea card body text author timestamp
    Then idea cards should show body text author and timestamp

  Scenario: Document card title document_type badge first-line preview
    Then document cards should show title a document type badge and a text preview

  Scenario: Link card og image title description domain
    Then link cards should show an image title description and the domain

  Scenario: Voice card audio player
    Then voice cards should contain an audio player

  Scenario: Photo card thumbnail
    Then photo cards should show an image thumbnail

  Scenario: Drawing card thumbnail and title
    Then drawing cards should show a thumbnail and title

  Scenario: Research card AI Research badge summary preview
    Then research cards should show an "AI Research" badge and a summary

  Scenario: File card filename size type icon download disabled in Tier 1
    Then file cards should show filename size and type icon
    And the download button should be disabled

  Scenario: Cards adapt to narrow compact and wide full metadata containers
    Then cards should render correctly in both narrow and wide containers
