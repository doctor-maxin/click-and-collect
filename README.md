# Sin Storefront

SSR-витрина интернет-магазина SIN. Приложение показывает контент из Strapi,
каталог из Medusa и использует Meilisearch для поиска и фильтрации товаров.

## Стек

- Nuxt 4, Vue 3, TypeScript, SSR/Nitro;
- Bun — пакетный менеджер, runtime сборки и production-сервера;
- Tailwind CSS 4, Headless UI/Reka UI;
- Pinia с сохранением части состояния в браузере;
- Medusa JS SDK — товары, категории, варианты и регионы;
- Strapi REST/GraphQL — страницы, меню и блоки главной;
- Meilisearch — каталог, полнотекстовый поиск, фасеты и сортировка;
- Nuxt SEO, sitemap и robots — поисковая индексация;
- GitLab CI/CD, rsync и PM2 — доставка и запуск на серверах.

Версии зависимостей зафиксированы в `bun.lock`. В проекте нет настроенных
команд lint, typecheck и автоматических тестов; обязательная локальная проверка
перед push — production-сборка.

## Быстрый старт

Требуются Git, Node.js (нужен Nuxt и части tooling) и Bun. Версия Bun в CI —
`1.3.3`, поэтому для воспроизводимой сборки рекомендуется использовать её же.

```bash
git clone git@gitlab.fesretail.com:re-coders/ecom/frontend.git
cd frontend
cp .env.example .env
bun install
bun run dev
```

После заполнения `.env` приложение доступно на <http://localhost:3000>.

Основные команды:

```bash
bun run dev       # dev-сервер с HMR
bun run build     # production SSR-сборка в .output/
bun run start     # запуск готовой сборки через Bun
bun run preview   # локальный preview средствами Nuxt
bun run generate  # статическая генерация (не используется в деплое)
```

## Конфигурация

Рабочие значения выдаются командой проекта и хранятся только в локальном
`.env` либо в защищённых GitLab CI/CD Variables. Не коммитьте `.env` и токены.

| Переменная | Назначение |
| --- | --- |
| `NUXT_SITE_URL` | Канонический публичный URL, sitemap и SEO |
| `NUXT_SITE_NAME` | Название сайта в meta/schema.org |
| `NUXT_SITE_DESCRIPTION` | Описание сайта по умолчанию |
| `NUXT_DEFAULT_LOCALE` | Локаль SEO-модулей |
| `NUXT_YANDEX_API_KEY` | API-ключ Яндекс Карт |
| `STRAPI_URL` | URL Strapi без завершающего `/` |
| `STRAPI_TOKEN` | Bearer token Strapi REST и GraphQL |
| `NUXT_MEDUSA_URL` | URL Medusa backend |
| `NUXT_MEDUSA_TOKEN` | Publishable API key Medusa |
| `NUXT_SEARCH_URL` | URL Meilisearch |
| `NUXT_SEARCH_API_KEY` | Search-only API key Meilisearch |
| `NUXT_PUBLIC_CDN_DOMAIN` | Hostname CDN без протокола для custom S3 image provider |
| `NUXT_PUBLIC_MEDIA_STORAGE_URL` | Публичный origin исходных media-файлов; используется для GIF без обработки CDN |
| `FTP_HOST`, `FTP_USER`, `FTP_PASS` | Доступ к XML с точками магазинов |
| `PORT` | Порт Nitro-сервера; по умолчанию `3000` |

Все поля в `runtimeConfig.public` попадают в клиентский bundle. Поэтому токены
Medusa, Strapi и Meilisearch должны иметь только минимальные права на чтение и
не должны быть административными ключами.

## Архитектура и структура

Nuxt настроен с `srcDir: src`, а маршруты намеренно лежат не в стандартной
папке `pages`, а в `src/app/routes`.

```text
src/
├── app/                 # маршруты, layout, плагины, GraphQL-запросы, стили
│   └── routes/          # /, /search, /catalog/:handle,
│                       # /products/:handle, /pages/:handle
├── pages/               # UI и логика полноценных страниц (не Nuxt routes)
├── widgets/             # крупные составные блоки: header, footer, grid, CMS blocks
├── features/            # пользовательские сценарии: поиск, фильтры, zoom и т. п.
├── shared/              # общие UI-компоненты, API-клиенты, stores и утилиты
└── providers/           # custom image provider для S3/CDN
server/
├── api/map-points.ts    # Nitro API: загрузка и разбор XML точек по FTP
└── api/__sitemap__/     # динамические URL sitemap из Medusa и Strapi
shared/                  # типы и SEO-утилиты, доступные клиенту и серверу
public/                  # favicon, manifest, статические изображения и шрифты
```

Зависимости направлены от маршрута к странице, затем к widgets/features/shared.
Переиспользуемые компоненты следует держать в `shared/ui`; Nuxt автоматически
регистрирует их с префиксом `Ui`. Публичные API модулей экспортируются через
`index.ts`, поэтому внешнему коду лучше импортировать модуль, а не его внутренний
файл.

### Данные и состояние

- Layout один раз загружает конфигурацию Strapi, регион и дерево категорий
  Medusa, а также доступные категории Meilisearch через `useAsyncData`.
- Страница товара получает карточку и варианты из Medusa.
- Каталог и поиск обращаются к индексам Meilisearch (`cards`, `categories`) и
  синхронизируют фильтры/страницу с query string.
- Главная, статические страницы, header/footer и динамические блоки приходят из
  Strapi через запросы из `src/app/queries`.
- Pinia хранит фильтры, выбранный вариант товара, историю поиска и недавно
  просмотренные товары. Persisted stores используют browser storage.
- `/api/map-points` скачивает `XML СИН.xml`, кэширует его как `localfile.xml` и
  возвращает распарсенные точки. Файл не должен коммититься.

При добавлении нового route создайте тонкий route-компонент в `src/app/routes`,
а основную реализацию разместите в подходящем модуле `src/pages`. Новый тип CMS
блока добавляется в renderer под `src/widgets/render-blocks/ui/blocks`.

## Git workflow и push

Удалённый репозиторий: `git@gitlab.fesretail.com:re-coders/ecom/frontend.git`.
Рабочие ветки в истории имеют формат `feat/eco-<номер>`; `develop` разворачивает
staging, `master` (также поддерживается `main`) — production.

```bash
git switch develop
git pull --ff-only origin develop
git switch -c feat/eco-123

# разработка и обязательная проверка
bun run build
git status
git add <изменённые-файлы>
git commit -m "Краткое описание изменения"
git push -u origin feat/eco-123
```

После push создайте Merge Request в `develop`. Merge/push в `develop`
автоматически запускает staging deploy. Для production изменения переносятся в
`master`; текущий pipeline запускает production deploy автоматически, без
ручного подтверждения. Детали и переменные CI — в [DEPLOYMENT.md](./DEPLOYMENT.md).

## Важные особенности

- Приложение SSR; код, использующий `window`, `document` или browser storage,
  должен выполняться только на клиенте.
- `nuxt.config.ts` публикует интеграционные ключи через public runtime config —
  используйте ключи только для чтения.
- Изображения обрабатываются `@nuxt/image`; источники Strapi и CDN зависят от
  корректных URL в `.env`.
- Sitemap собирается во время запроса из внешних сервисов. Недоступность Medusa
  или Strapi влияет на `/sitemap.xml`.
- Сборка создаёт `.output/server/index.mjs`; именно её запускают Bun и PM2.
