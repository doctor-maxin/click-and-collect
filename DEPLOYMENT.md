# Сборка и деплой

Проект доставляется через GitLab CI/CD. Pipeline не собирает приложение внутри
контейнера: он формирует `.env`, синхронизирует весь checkout на сервер через
`rsync`, затем сервер выполняет `bun install`, `bun run build` и reload PM2.

## Связь веток и окружений

| Ветка | GitLab job | Окружение | PM2 process | Режим запуска |
| --- | --- | --- | --- | --- |
| `develop` | `deploy_staging` | `staging` | `sin-storefront-dev` | автоматически |
| `master` / `main` | `deploy_production` | `production` | `sin-storefront-prod` | автоматически |

В `.gitlab-ci.yml` нет `when: manual`, поэтому production job стартует сразу
после push/merge в production-ветку. Защиту веток и обязательное подтверждение,
если они нужны, следует настраивать в GitLab или явно добавлять в pipeline.

## GitLab CI/CD Variables

Для staging:

| Переменная | Назначение |
| --- | --- |
| `SSH_PRIVATE_KEY` | Приватный SSH-ключ deploy user |
| `SSH_PASSPHRASE` | Passphrase ключа, если есть |
| `SSH_PORT` | SSH-порт; необязательно, по умолчанию `22` |
| `DEPLOY_HOST` | Host staging-сервера |
| `DEPLOY_USER` | SSH-пользователь |
| `DEPLOY_PATH` | Абсолютная директория приложения на сервере |
| `DEV_ENV` | Полное содержимое staging `.env` |

Для production используются аналоги с суффиксом `_PROD`:
`SSH_PRIVATE_KEY_PROD`, `SSH_PASSPHRASE_PROD`, `SSH_PORT_PROD`,
`DEPLOY_HOST_PROD`, `DEPLOY_USER_PROD`, `DEPLOY_PATH_PROD` и `PROD_ENV`.

`DEV_ENV` и `PROD_ENV` должны содержать актуальные переменные приложения из
`.env.example`. Секреты следует хранить как masked/protected variables. Для
protected production variables ветка `master` тоже должна быть protected.

## Требования к серверу

- Bash;
- Bun в `$HOME/.bun/bin`;
- Node.js/npm (PM2-конфигурация вызывает npm через Bun interpreter);
- глобально установленный PM2;
- достаточно памяти и места для `node_modules`, новой `.output` и одной копии
  `.output.backup`;
- deploy user может писать в `DEPLOY_PATH` и управлять своими PM2-процессами.

Оба окружения слушают `PORT=3000`. Внешний доступ обычно должен идти через
настроенный отдельно reverse proxy (Nginx/аналог); его конфигурации в этом
репозитории нет.

## Что делает pipeline

1. Alpine job устанавливает `openssh-client`, `rsync` и `sshpass`.
2. Добавляет ключ и host в SSH-конфигурацию, проверяет соединение.
3. Записывает `DEV_ENV` либо `PROD_ENV` в локальный `.env` job-а.
4. `rsync --delete` копирует checkout на сервер, исключая только `.git`.
5. На сервере запускается `deploy.sh` либо `deploy-production.sh`.
6. Скрипт устанавливает зависимости, собирает `.output`, создаёт `logs/`,
   выполняет `pm2 startOrReload ... --update-env` и `pm2 save`.
7. Деплой считается успешным, если нужный PM2 process имеет статус `online`.

PM2 запускает `bun .output/server/index.mjs` через package script `start`.
Несмотря на старое имя `sin-storefront-dev`, staging также собирается и работает
с `NODE_ENV=production`.

## Проверка и эксплуатация

Локально перед merge:

```bash
bun install
bun run build
test -f .output/server/index.mjs
```

На сервере:

```bash
pm2 status
pm2 logs sin-storefront-dev       # staging
pm2 logs sin-storefront-prod      # production
pm2 info sin-storefront-prod
```

Файлы логов обоих окружений находятся в `logs/err.log`, `logs/out.log` и
`logs/combined.log` относительно deploy directory. PM2 перезапускает процесс при
падении и при потреблении более 2 GB памяти.

## Откат

Deploy script перед сборкой копирует текущую `.output` в `.output.backup`.
Копия только одна и при следующем деплое перезаписывается.

```bash
cd <DEPLOY_PATH>
mv .output .output.failed
mv .output.backup .output
pm2 startOrReload ecosystem.production.config.cjs --update-env
```

Для staging используйте `ecosystem.config.cjs`. После проверки неудачную
`.output.failed` можно удалить вручную.

## Ограничения текущей схемы

- CI не выполняет отдельные lint, typecheck или test jobs — таких scripts сейчас
  нет в `package.json`.
- Сборка происходит уже на целевом сервере, поэтому результат зависит от версии
  установленного там Bun и доступности package registry/API во время build.
- `rsync --delete` синхронизирует почти весь checkout, включая локально созданные
  артефакты job-а; постоянные файлы следует хранить вне `DEPLOY_PATH`.
- Health check проверяет статус PM2, но не делает HTTP-запрос к приложению.
- Backup создаётся после новой сборки в текущей реализации, поэтому при сборке в
  той же `.output` нужно отдельно проверить, что копия действительно содержит
  предыдущую рабочую версию.
