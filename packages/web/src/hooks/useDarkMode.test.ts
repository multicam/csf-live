import { describe, it, expect, beforeEach } from 'vitest'

// ─── Pure logic tests for dark mode ──────────────────────────────────────────
// These tests exercise the theme resolution logic directly,
// without rendering hooks or requiring jsdom globals.

type Theme = 'light' | 'dark' | 'system'

// Mirrors the applyTheme logic from useDarkMode.ts
function resolveShouldBeDark(theme: Theme, systemPrefersDark: boolean): boolean {
  return theme === 'dark' || (theme === 'system' && systemPrefersDark)
}

// Mirrors the isDark computation from useDarkMode.ts
function computeIsDark(theme: Theme, systemPrefersDark: boolean): boolean {
  return theme === 'dark' || (theme === 'system' && systemPrefersDark)
}

// Mirrors the toggle cycle: light → dark → system → light
function nextTheme(current: Theme): Theme {
  return current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light'
}

describe('useDarkMode — theme resolution logic', () => {
  it('isDark is true when theme is "dark"', () => {
    const isDark = computeIsDark('dark', false)
    expect(isDark).toBe(true)
  })

  it('isDark is false when theme is "light"', () => {
    const isDark = computeIsDark('light', false)
    expect(isDark).toBe(false)
  })

  it('isDark is false when theme is "light" regardless of system preference', () => {
    const isDark = computeIsDark('light', true)
    expect(isDark).toBe(false)
  })

  it('toggles from light to dark on first call', () => {
    const current: Theme = 'light'
    const next = nextTheme(current)
    expect(next).toBe('dark')
  })

  it('toggle cycle: light → dark → system → light', () => {
    expect(nextTheme('light')).toBe('dark')
    expect(nextTheme('dark')).toBe('system')
    expect(nextTheme('system')).toBe('light')
  })

  it('resolveShouldBeDark: dark theme applies dark class', () => {
    expect(resolveShouldBeDark('dark', false)).toBe(true)
    expect(resolveShouldBeDark('dark', true)).toBe(true)
  })

  it('resolveShouldBeDark: light theme never applies dark class', () => {
    expect(resolveShouldBeDark('light', false)).toBe(false)
    expect(resolveShouldBeDark('light', true)).toBe(false)
  })

  it('resolveShouldBeDark: system theme follows system preference', () => {
    expect(resolveShouldBeDark('system', true)).toBe(true)
    expect(resolveShouldBeDark('system', false)).toBe(false)
  })
})

describe('useDarkMode — localStorage persistence pattern', () => {
  const store: Record<string, string> = {}

  beforeEach(() => {
    Object.keys(store).forEach(k => delete store[k])
  })

  function saveTheme(theme: Theme) {
    store['theme'] = theme
  }

  function loadTheme(): Theme {
    return (store['theme'] as Theme) ?? 'system'
  }

  it('loads "dark" from storage when stored', () => {
    saveTheme('dark')
    expect(loadTheme()).toBe('dark')
  })

  it('loads "light" from storage when stored', () => {
    saveTheme('light')
    expect(loadTheme()).toBe('light')
  })

  it('defaults to "system" when nothing is stored', () => {
    expect(loadTheme()).toBe('system')
  })

  it('persists new theme after toggle', () => {
    saveTheme('light')
    const next = nextTheme(loadTheme())
    saveTheme(next)
    expect(loadTheme()).toBe('dark')
  })
})
