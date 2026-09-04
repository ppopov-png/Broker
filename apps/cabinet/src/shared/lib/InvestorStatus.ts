export type InvestorTier = 'Member' | 'Silver' | 'Gold' | 'Platinum' | 'Black'

export interface InvestorStatusInput {
  qualifiedCapital: number
  longTermCapital: number
  completedEvents: number
  activeEvents: number
  tenureMonths: number
  qualifiedReferrals: number
}

export interface InvestorStatusBreakdown {
  capital: number
  longTerm: number
  events: number
  tenure: number
  referrals: number
}

export interface InvestorStatusResult {
  score: number
  tier: InvestorTier
  nextTier: InvestorTier | null
  nextThreshold: number | null
  progress: number
  pointsToNext: number
  breakdown: InvestorStatusBreakdown
}

export const INVESTOR_TIERS: { tier: InvestorTier; threshold: number }[] = [
  { tier: 'Member', threshold: 0 },
  { tier: 'Silver', threshold: 200 },
  { tier: 'Gold', threshold: 500 },
  { tier: 'Platinum', threshold: 1000 },
  { tier: 'Black', threshold: 2500 },
]

export function calculateInvestorStatus(input: InvestorStatusInput): InvestorStatusResult {
  const breakdown: InvestorStatusBreakdown = {
    capital: Math.round(Math.max(0, input.qualifiedCapital) / 1000 * 7.5),
    longTerm: Math.round(Math.max(0, input.longTermCapital) / 1000 * 4),
    events: Math.round(Math.max(0, input.completedEvents) * 4 + Math.max(0, input.activeEvents) * 8),
    tenure: Math.min(100, Math.round(Math.max(0, input.tenureMonths) * 5)),
    referrals: Math.round(Math.max(0, input.qualifiedReferrals) * 15),
  }

  const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0)
  let tierIndex = 0
  for (let index = 0; index < INVESTOR_TIERS.length; index += 1) {
    if (score >= INVESTOR_TIERS[index].threshold) tierIndex = index
  }

  const current = INVESTOR_TIERS[tierIndex]
  const next = INVESTOR_TIERS[tierIndex + 1] ?? null
  const range = next ? Math.max(1, next.threshold - current.threshold) : 1
  const progress = next ? Math.min(100, Math.max(0, (score - current.threshold) / range * 100)) : 100

  return {
    score,
    tier: current.tier,
    nextTier: next?.tier ?? null,
    nextThreshold: next?.threshold ?? null,
    progress,
    pointsToNext: next ? Math.max(0, next.threshold - score) : 0,
    breakdown,
  }
}

export const tierAccent: Record<InvestorTier, string> = {
  Member: '#71719b',
  Silver: '#a9afbd',
  Gold: '#d7b24a',
  Platinum: '#d7e4f4',
  Black: '#11121d',
}
