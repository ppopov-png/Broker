/**
 * Форматирование чисел для публичных страниц. Одно место, потому что
 * разные разделители в соседних блоках читаются как ошибка вёрстки.
 */

/** Доллары без копеек и с неразрывным пробелом между разрядами. */
export function usd(value: number): string {
  return `$${Math.round(value).toLocaleString('ru-RU').replace(/ /g, ' ')}`
}

/** Проценты со знаком минус в типографском виде. */
export function pct(value: number, digits = 1): string {
  return `${value >= 0 ? '' : '−'}${Math.abs(value).toFixed(digits)}%`
}
