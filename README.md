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

### Deploy и rollback по immutable digest

Локальный deployment adapter запускает уже опубликованный образ без сборки текущего checkout.
Обе ссылки обязательны и должны иметь полный вид `registry/repository@sha256:<64 hex>`; previous
берётся из ранее подтверждённых release metadata:

```bash
npm run deploy:local -- --target ghcr.io/owner/broker@sha256:<target-digest> --previous ghcr.io/owner/broker@sha256:<previous-digest>
```

Adapter выполняет `docker compose pull`, переключает только сервис `broker` через `--no-build`,
ждёт container healthcheck и запускает полный Playwright smoke против published endpoint фактического
контейнера. Порт по-прежнему задаётся через `BROKER_HTTP_PORT` (в том числе через Compose `.env`),
но передавать его в deploy-команду не требуется: adapter читает binding после запуска. `--endpoint`
можно указать как дополнительную проверку ожидаемого host/port; несовпадение остановит rollout до smoke:

```bash
BROKER_HTTP_PORT=8090 npm run deploy:local -- --target <image@sha256:digest> --previous <image@sha256:digest> --endpoint http://127.0.0.1:8090 --timeout 180000
```

Если target не запускается или не проходит проверки, adapter без пересборки переключается на previous
и повторяет healthcheck и весь smoke. Для явного отката используйте предыдущий проверенный digest как
новый `--target`, а текущий digest — как `--previous`. Команда печатает JSON со статусом `deployed`,
`rolled_back`, `deploy_failed` или `rollback_failed`; последние два статуса завершаются ненулевым кодом.

Состояние, активная immutable-ссылка, логи и остановка:

```bash
docker compose ps
docker inspect --format '{{.Config.Image}}' "$(docker compose ps -q broker)"
docker compose logs broker
docker compose down
```

На PowerShell идентификатор контейнера сначала сохраните в `$brokerContainer = docker compose ps -q broker`,
затем выполните `docker inspect --format '{{.Config.Image}}' $brokerContainer`.

Runner в `scripts/deploy/contract.mjs` фиксирует платформо-независимый контракт adapter: входы — target,
previous, endpoint и timeout; результат — статус, requested/actual digest, факт rollback и безопасная
диагностика. Stage/prod реализация появится отдельно после выбора платформы; manifests, DNS, TLS и
credentials в этом репозитории намеренно не имитируются.

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

Сейчас workflow намеренно поддерживает только GHCR. Канонический immutable
идентификатор релиза — сохранённая ссылка `image@sha256:<digest>`; SHA-тег служит
удобной ссылкой, а не trust boundary. Workflow отказывается публиковать уже
существующий SHA-тег и сразу проверяет, что он указывает на аттестованный digest.
Используется только встроенный `GITHUB_TOKEN`; credentials не попадают в image layers или логи.
Для rollback используйте сохранённый digest, а не mutable alias.
