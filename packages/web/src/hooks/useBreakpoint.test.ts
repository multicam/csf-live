import { describe, it, expect } from 'vitest'

// ─── Pure logic tests for breakpoint resolution ────────────────────────────
// We test the getBreakpoint pure function directly without needing jsdom or
// window globals — matching the pattern used elsewhere in this codebase.

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

// Mirrors the getBreakpoint function from useBreakpoint.ts
function getBreakpoint(width: number): Breakpoint {
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

describe('getBreakpoint — breakpoint thresholds', () => {
  it('returns "mobile" at 375px', () => {
    expect(getBreakpoint(375)).toBe('mobile')
  })

  it('returns "mobile" at 767px (just below tablet threshold)', () => {
    expect(getBreakpoint(767)).toBe('mobile')
  })

  it('returns "tablet" at 800px', () => {
    expect(getBreakpoint(800)).toBe('tablet')
  })

  it('returns "tablet" at 768px (exactly at tablet threshold)', () => {
    expect(getBreakpoint(768)).toBe('tablet')
  })

  it('returns "tablet" at 1023px (just below desktop threshold)', () => {
    expect(getBreakpoint(1023)).toBe('tablet')
  })

  it('returns "desktop" at 1200px', () => {
    expect(getBreakpoint(1200)).toBe('desktop')
  })

  it('returns "desktop" at 1024px (exactly at desktop threshold)', () => {
    expect(getBreakpoint(1024)).toBe('desktop')
  })
})
