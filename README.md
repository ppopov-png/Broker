# Trigonum Broker 2.0

Новая реализация Broker с нуля.

## Приложения

- `apps/site` — публичный сайт.
- `apps/onboarding` — регистрация, KYC и первичное пополнение.
- `apps/cabinet` — личный кабинет после активации аккаунта.

В разработке это три независимых Vite-приложения, а при публикации они собираются в один продукт:

```text
/       → site
/open/  → onboarding
/app/   → cabinet
```

Кнопка «Открыть счёт» ведёт в onboarding, кнопка «Войти» — в cabinet.

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

Каждое приложение запускается в отдельном терминале из корня проекта:

```bash
npm run dev:site
npm run dev:onboarding
npm run dev:cabinet
```

Dev-серверы слушают все сетевые интерфейсы (`0.0.0.0`). Порты:

- site: `5173`
- onboarding: `5174`
- cabinet: `5175`

При локальной разработке ссылки между приложениями автоматически используют тот же hostname, с которого открыт сайт. Поэтому LAN-адрес компьютера не зашит в код.

## Сборка

```bash
npm run build
```

## Автоматический deploy

Workflow: `.github/workflows/deploy-pages.yml`.

Каждый обычный `push` в ветку `broker-2.0` автоматически:

1. устанавливает зависимости через `npm ci`;
2. собирает `site`, `onboarding` и `cabinet`;
3. объединяет их в один Pages artifact;
4. публикует его через GitHub Pages.

Для репозитория `Broker` итоговая структура GitHub Pages будет:

```text
https://ppopov-png.github.io/Broker/       → публичный сайт
https://ppopov-png.github.io/Broker/open/  → onboarding
https://ppopov-png.github.io/Broker/app/   → личный кабинет
```

### Однократная настройка GitHub

В репозитории откройте:

`Settings → Pages → Build and deployment → Source → GitHub Actions`

После этого workflow можно один раз запустить вручную во вкладке `Actions → Deploy Broker 2.0 → Run workflow`. Дальнейшие push в `broker-2.0` будут разворачиваться автоматически.

Для будущего собственного домена архитектуру приложений менять не потребуется: `/`, `/open/` и `/app/` можно сохранить за nginx/Cloudflare/Vercel.
