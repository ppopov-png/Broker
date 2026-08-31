# Trigonum Broker 2.0

Новая реализация Broker с нуля.

## Приложения

- `apps/site` — публичный сайт.
- `apps/onboarding` — регистрация, KYC и первичное пополнение.
- `apps/cabinet` — личный кабинет после активации аккаунта.

## Общие пакеты

- `packages/ui` — переиспользуемые UI-примитивы.
- `packages/brand` — дизайн-токены и фирменные стили.
- `packages/shared` — общие типы и утилиты.
- `packages/api` — единый HTTP/API transport.

## Установка

```bash
npm install
```

## Запуск

```bash
npm run dev:site
npm run dev:onboarding
npm run dev:cabinet
```

Порты по умолчанию: site `5173`, onboarding `5174`, cabinet `5175`.

## Сборка

```bash
npm run build
```
