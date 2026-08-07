# Trigonum Broker

Отдельное веб-приложение для работы инвестора и тимлида с предложениями, портфелем, договорами, средствами и отчётностью. Broker не является торговым терминалом: сделки, ордера и управление командой остаются в Trigonum Team / Trading.

## Запуск

```bash
npm install
npm run dev
```

По умолчанию Vite выводит локальный адрес в терминал. Проверка production-сборки:

```bash
npm run build
```

## Роли и маршруты

- `investor` — `/investor/overview`, `/investor/offers`, `/investor/portfolio`, `/investor/operations`, `/investor/reports`, `/investor/messages`.
- `team-lead` — `/team-lead/overview`, `/team-lead/offers`, `/team-lead/applications`, `/team-lead/portfolio`, `/team-lead/operations`, `/team-lead/reports`, `/team-lead/messages`.

Подробности — в [docs/STACK.md](docs/STACK.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) и [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md).
