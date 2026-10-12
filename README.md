# Trigonum Broker

Монорепозиторий фронтенда Broker:

- `apps/site` — публичный сайт;
- `apps/onboarding` — регистрация и открытие счёта;
- `apps/cabinet` — личный кабинет;
- `packages/*` — общий UI, бренд, типы и API-клиент.

## Локальная разработка

```bash
npm ci
npm run dev:site
npm run dev:onboarding
npm run dev:cabinet
```

Dev-серверы работают на портах 5173, 5174 и 5175.

## Проверка

```bash
npm run lint
npm run build
```

## Локальное развёртывание

GitHub Pages больше не используется. Production-подобная сборка запускается
локально через Docker Compose:

```bash
docker compose up --build -d
```

После запуска:

- `http://localhost:8080/` — публичный сайт;
- `http://localhost:8080/open/` — onboarding;
- `http://localhost:8080/app/` — личный кабинет;
- `http://localhost:8080/healthz` — health check.

Порт можно изменить через переменную `BROKER_HTTP_PORT`:

```bash
BROKER_HTTP_PORT=8090 docker compose up --build -d
```

Остановка:

```bash
docker compose down
```

Этот же образ рассчитан на будущий VPS: перед контейнером достаточно поставить
Caddy, Traefik или внешний Nginx для домена и TLS. Содержимое и маршруты приложения
при переносе менять не потребуется.

## GitHub

Workflow `Broker CI` только проверяет lint, сборку и Docker-образ. Автоматической
публикации на Pages больше нет. Рабочие ветки создаёт Broker Pipeline; он отправляет
ветку в GitHub и при доступном `gh` может создать pull request.
