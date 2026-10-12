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
npm run typecheck
npm test
npm run test:contracts
npm run security
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

Workflow `Broker CI` проверяет типы, Oxlint, unit/contract-тесты, production-зависимости,
сборку и браузерный smoke Docker-образа. Автоматической
публикации на Pages больше нет. Рабочие ветки создаёт Broker Pipeline; он отправляет
ветку в GitHub и при доступном `gh` может создать pull request.

### CI gates и Docker smoke

Проверки запускаются на Node 22 после `npm ci` по lockfile. `typecheck` отдельно
проверяет три приложения, все `packages/**/*.ts` и `packages/**/*.tsx`, включая
неимпортированные публичные экспорты, а также тесты и их конфигурацию. CSS-пакет
brand проходит существующие lint/build. Unit и contract используют Vitest;
contract импортирует публичный `@trigonum/shared` с изолированным localStorage
и фиксированным временем. Пустая выборка тестов завершает команду ошибкой.

Для smoke нужен работающий Docker и Chromium Playwright:

```bash
npx playwright install chromium
docker build -t broker:$(git rev-parse HEAD) .
npm run test:e2e
```

В PowerShell тег можно получить через `$brokerSha = git rev-parse HEAD`, затем
выполнить `docker build -t "broker:$brokerSha" .` и `npm run test:e2e`.
Команда запускает собранный образ, выделяет свободный localhost-порт, ждёт
`/healthz`, проверяет `/`, `/open/`, `/app/`, hash-регистрацию, redirect на login,
прямой login, локальные JS/CSS (статус, MIME и содержимое), ошибки браузера и
серверный SPA fallback каждого корня. Dev server и credentials не используются.
Контейнер удаляется после успеха, ошибки и обрабатываемого сигнала отмены.
Для другого локального тега задайте `BROKER_IMAGE`, для фиксированного порта —
`BROKER_SMOKE_PORT`; `BROKER_SHA` задаёт SHA в локальной диагностике.

`security` выполняет `npm audit --omit=dev --audit-level=high --json`.
High/critical production-уязвимости, ошибка audit-сервиса, невалидный отчёт
или ненулевой код audit блокируют gate. Отчёт сохраняется в
`reports/security.json`; автоматического audit fix и изменения lockfile нет.
Эта политика не проверяет backend и ОС контейнера.

`npm run ci:gate -- <команда>` сохраняет вывод и метаданные gate в `reports/`.
CI сохраняет эти файлы как artifacts с SHA на 14 дней, а Docker smoke также
сохраняет ID образа/контейнера, логи Nginx, inspect, HTML/JUnit-отчёты Playwright,
trace и screenshot при сбое. Локальные отчёты исключены из Git.
У тестов нет автоматических retries; ожидание health ограничено 60 секундами.

В CI каждый gate имеет отдельное имя. Итоговый check **Broker CI required**
успешен только при успехе всех gates, Docker smoke и release job на `main`;
failure, skipped, cancelled и отсутствующий результат дают ошибку. Администратор
репозитория должен назначить этот check required в branch protection, чтобы
блокировать merge.

После успешных gates и Docker smoke push в `main` передаёт уже проверенный OCI
образ в release job — production-образ не пересобирается. Release job публикует
его в `${CONTAINER_REGISTRY:-ghcr.io}/${CONTAINER_IMAGE:-owner/repository}` с
полным commit SHA в `org.opencontainers.image.revision`, получает digest,
прикрепляет provenance и SPDX SBOM к этому digest, проверяет обе attestation,
делает pull по `image@digest` и повторяет smoke. Все результаты сохраняются в
artifact `docker-release-<sha>`.

Сейчас workflow намеренно поддерживает только GHCR: repository administrator
должен включить server-side immutability для commit-SHA tags и установить
repository variable `CONTAINER_REGISTRY_IMMUTABLE=true`. Workflow также
отказывается публиковать уже существующий SHA-тег и проверяет digest после push;
предварительная проверка не заменяет server-side policy. Используется только
встроенный `GITHUB_TOKEN`; credentials не попадают в image layers или логи.
Для rollback используйте сохранённый digest, а не mutable alias.
