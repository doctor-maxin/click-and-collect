# Руководство по деплою

Этот документ описывает процесс автоматического деплоя приложения на staging и production среды.

## Обзор

Проект использует GitLab CI/CD для автоматического деплоя:
- **Staging** - деплой происходит автоматически при пуше в ветку `develop`
- **Production** - деплой происходит вручную при пуше в ветку `master`/`main`

## Переменные окружения

### Staging (develop ветка)

В GitLab CI/CD Settings > Variables нужно настроить следующие переменные:

```bash
# SSH подключение
SSH_PRIVATE_KEY=<приватный SSH ключ для staging сервера>
DEPLOY_HOST=<хост staging сервера>
DEPLOY_USER=<пользователь для подключения к staging серверу>
DEPLOY_PATH=<путь для деплоя на staging сервере>

# Переменные приложения
NUXT_PUBLIC_API_BASE=<базовый URL API для staging>
STRAPI_URL=<URL Strapi для staging>
DATABASE_URL=<строка подключения к БД для staging>
REDIS_URL=<строка подключения к Redis для staging>
```

### Production (master ветка)

Для production окружения используются отдельные переменные с суффиксом `_PROD`:

```bash
# SSH подключение
SSH_PRIVATE_KEY_PROD=<приватный SSH ключ для production сервера>
DEPLOY_HOST_PROD=<хост production сервера>
DEPLOY_USER_PROD=<пользователь для подключения к production серверу>
DEPLOY_PATH_PROD=<путь для деплоя на production сервере>

# Переменные приложения
NUXT_PUBLIC_API_BASE=<базовый URL API для production>
STRAPI_URL=<URL Strapi для production>
DATABASE_URL=<строка подключения к БД для production>
REDIS_URL=<строка подключения к Redis для production>
JWT_SECRET=<секретный ключ JWT для production>
```

## Процесс деплоя

### Staging Деплой

1. Создайте Pull Request в ветку `develop`
2. После мержа код автоматически задеплоится на staging
3. Проверьте работу приложения на staging окружении

### Production Деплой

1. Создайте Pull Request в ветку `master`
2. После мержа в GitLab CI появится manual job для production деплоя
3. Нажмите кнопку "Run" для запуска production деплоя
4. Деплой произойдет с использованием `ecosystem.production.config.cjs`

## Конфигурация серверов

### PM2 конфигурация

- **Staging**: использует `ecosystem.config.cjs` с базовыми настройками
- **Production**: использует `ecosystem.production.config.cjs` с расширенными настройками:
  - Кластерный режим
  - Автоматический перезапуск при превышении лимита памяти
  - Логирование в файлы
  - Health checks

### Требования к серверу

Убедитесь, что на целевых серверах установлено:

- Node.js (через nvm)
- Bun runtime
- PM2 process manager
- SSH доступ для пользователя деплоя

```bash
# Установка зависимостей на сервере
curl -fsSL https://bun.sh/install | bash
npm install -g pm2
pm2 startup # настройка автозапуска PM2
```

## Структура файлов

```
.
├── .gitlab-ci.yml                    # CI/CD конфигурация
├── ecosystem.config.cjs              # PM2 конфигурация для staging
├── ecosystem.production.config.cjs   # PM2 конфигурация для production
├── deploy.sh                         # Скрипт деплоя для staging
├── deploy-production.sh              # Скрипт деплоя для production
└── DEPLOYMENT.md                     # Эта документация
```

## Логи и мониторинг

### Просмотр логов

```bash
# На сервере
pm2 logs sin-storefront        # staging
pm2 logs sin-storefront-prod   # production

# Логи в файлах (только production)
tail -f logs/out.log
tail -f logs/err.log
tail -f logs/combined.log
```

### Мониторинг

```bash
pm2 status              # статус всех процессов
pm2 info <app-name>     # детальная информация о приложении
pm2 monit              # интерактивный мониторинг
```

## Откат изменений

В случае проблем с production деплоем:

```bash
# На production сервере
cd /path/to/deployment
ls -la *.backup.*       # найти резервную копию
rm -rf .output
mv .output.backup.YYYYMMDD_HHMMSS .output
pm2 reload ecosystem.production.config.cjs
```

## Безопасность

- SSH ключи хранятся в GitLab CI/CD Variables как защищенные переменные
- Production деплой требует ручного подтверждения
- Все чувствительные данные передаются через переменные окружения
- Логи не содержат секретных данных

## Troubleshooting

### Частые проблемы

1. **SSH ключ не работает**
   - Проверьте формат ключа (должен быть без паролей)
   - Убедитесь, что публичный ключ добавлен в `~/.ssh/authorized_keys`

2. **PM2 не может запустить приложение**
   - Проверьте, что Bun установлен в PATH
   - Убедитесь, что все зависимости установлены

3. **Приложение не отвечает**
   - Проверьте логи PM2
   - Убедитесь, что порт не занят другим процессом
   - Проверьте переменные окружения

### Полезные команды

```bash
# Проверка статуса деплоя
pm2 status
pm2 info <app-name>

# Перезапуск приложения
pm2 restart <app-name>

# Просмотр переменных окружения
pm2 env <process-id>

# Очистка PM2
pm2 kill
pm2 resurrect
```
