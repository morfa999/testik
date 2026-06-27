# Настройка Railway для KITSTUDIO

## ⚠️ Главная проблема

По логам видно что Railway деплоит проект как **статический сайт через Caddy**, а не как **Node.js приложение с PostgreSQL**:

```
Deploy: caddy run --config /Caddyfile --adapter caddyfile
```

Нужно чтобы Railway запускал:
```
node server.js
```

## 🔧 Решение

### Шаг 1: В Railway Dashboard
1. Откройте ваш проект на Railway
2. Перейдите в **Settings** сервиса
3. В разделе **Deploy** найдите **Start Command**
4. Установите: `node server.js`

### Шаг 2: Добавьте PostgreSQL базу данных
1. В вашем проекте Railway нажмите **+ New**
2. Выберите **Database** → **PostgreSQL**
3. Railway автоматически создаст переменную `DATABASE_URL`

### Шаг 3: Проверьте переменные окружения
В разделе **Variables** должны быть:
- `DATABASE_URL` (создается автоматически при добавлении PostgreSQL)
- `NODE_ENV=production` (опционально)

### Шаг 4: Перезапустите сервис
После изменений Railway автоматически передеплоит.

## ✅ Что сделано

1. **railpack.json** - конфигурация для запуска `node server.js`
2. **package.json** - добавлен скрипт `start: node server.js`
3. **server.js** - улучшен:
   - Поддержка DATABASE_URL, POSTGRES_URL, PG_URL
   - Создание всех таблиц при старте
   - Health endpoint `/api/health`
   - Подробные логи
   - Graceful fallback если БД недоступна

## 📊 Структура БД

Создаются автоматически при первом запуске:
- `users` - пользователи
- `sounds` - звуки
- `pending_sounds` - на модерации
- `packs` - паки
- `sessions` - сессии авторизации
- `reports` - репорты техподдержки
- `broadcasts` - уведомления
- `user_broadcasts` - прочитанные уведомления

## 🔍 Проверка работы

После деплоя откройте:
```
https://your-app.up.railway.app/api/health
```

Должно вернуть:
```json
{
  "ok": true,
  "db": true,
  "env": "production",
  "time": "2026-06-27T..."
}
```

Если `db: false` - проверьте что PostgreSQL добавлен и `DATABASE_URL` доступен.

## 🆘 Если проблемы остаются

1. Убедитесь что **Start Command** в Railway = `node server.js`
2. Убедитесь что PostgreSQL сервис добавлен в проект
3. Проверьте логи деплоя - должна быть строка `Server running on...`
4. Если видите `caddy run` - значит Railway все еще считает проект статическим

## 💡 Альтернативный вариант

Если не получается изменить Start Command:
1. Удалите `nixpacks.toml` если есть
2. Создайте `Procfile` со строкой: `web: node server.js`
