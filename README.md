# Sin Storefront

Nuxt.js приложение для интернет-магазина с автоматическим деплоем.

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Deployment

Приложение автоматически деплоится с помощью GitLab CI/CD:

- **Staging** - автоматический деплой при пуше в ветку `develop`
- **Production** - ручной деплой при пуше в ветку `master`

### Быстрый старт деплоя

1. Настройте переменные окружения в GitLab CI/CD
2. Запустите тест деплоя локально:
   ```bash
   ./test-deploy.sh
   ```
3. Пушьте изменения в соответствующую ветку

Подробная документация: [DEPLOYMENT.md](./DEPLOYMENT.md)

### Файлы конфигурации

- `ecosystem.config.cjs` - PM2 конфигурация для staging
- `ecosystem.production.config.cjs` - PM2 конфигурация для production
- `deploy.sh` - скрипт деплоя для staging
- `deploy-production.sh` - скрипт деплоя для production
- `.gitlab-ci.yml` - CI/CD пайплайн
