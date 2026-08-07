export const userRoles = ['investor', 'team-lead'] as const

export type UserRole = (typeof userRoles)[number]
