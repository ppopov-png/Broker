/**
 * Отставные шаблоны соглашений: пары (name, version), заменённые более новыми
 * загрузками. Фильтр применяется и к списку, и к проверке перехода на следующий
 * шаг — иначе бэкенд, вернувший старую строку, навсегда запрёт клиента здесь.
 */
const RETIRED: { name: string; version: string }[] = [
  { name: 'Asset Management Agreement', version: '1.0' },
  { name: 'Privacy Policy', version: '1.0' },
  { name: 'Virtual Assets Addendum', version: '1.0' },
]

export function isRetired(name: string, version: string): boolean {
  return RETIRED.some((item) => item.name === name && item.version === version)
}

export function filterRetired<T extends { template: { name: string; version: string } }>(items: T[]): T[] {
  return items.filter((item) => !isRetired(item.template.name, item.template.version))
}
