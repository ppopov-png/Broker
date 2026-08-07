# Audit — Market Strategies

Surface: `/investor/offers`, desktop investor flow.

## Steps

1. Open the strategy market — healthy. The catalogue, filters, results and application context are visible immediately.
2. Compare a strategy — healthy after improvements. Risk, current investor count, return, minimum, term and collateral coverage are visible on one row.
3. Open conditions — healthy. The primary action opens the details drawer with investment terms and a clear application action.
4. Submit an application — healthy. The drawer changes state and the right-side application panel shows `Заявка отправлена`.

## Findings and implemented improvements

- [Resolved] The action `Смотреть` was vague. It is now `Условия и заявка`, matching the investor's next decision.
- [Resolved] Orion was already an active strategy but appeared like a new offer. It now has a green signal rail and `В портфеле` state; repeat investment is blocked in its drawer.
- [Resolved] The list did not show demand or social proof. Each row now shows the number of investors.
- [Resolved] Risk was color-only. It remains color-coded but is labelled in text and paired with investor count.

## Accessibility notes

- Text labels accompany all status colors in the audited desktop state.
- Interactive actions have readable button names. Keyboard focus and screen-reader flow should still be checked in a dedicated accessibility pass.

## Evidence limits

- Browser captures and the detail/application flow were reviewed in the current local session. Empty search, narrow mobile view, reduced motion and keyboard-only traversal were not exhaustively audited.
