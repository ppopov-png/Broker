import { describe, expect, it } from 'vitest'
import { pct, usd } from '../../apps/site/src/lib/format'

describe('public number formatting', () => {
  it.each([
    [-12.34, 1, '−12.3%'],
    [-0.125, 3, '−0.125%'],
    [12, 2, '12.00%'],
    [0, 0, '0%'],
  ])('pct(%s, %s) preserves sign and precision', (value, digits, expected) => {
    expect(pct(value, digits)).toBe(expected)
  })
  it('uses one decimal by default', () => expect(pct(4)).toBe('4.0%'))
  it('rounds dollars and groups thousands', () => expect(usd(1234.6)).toBe('$1\u00a0235'))
})
