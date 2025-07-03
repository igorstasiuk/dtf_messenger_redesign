# DTF Messenger Chrome Extension

Современное Chrome расширение для чата на DTF.ru, построенное с использованием Vue 3, TypeScript и Tailwind CSS.

## 🚀 Особенности

- **Vue 3 + TypeScript** - Современная архитектура с полной типизацией
- **Tailwind CSS** - Адаптивный дизайн с автоматической сменой темы
- **Pinia** - Управление состоянием приложения
- **Chrome Extension Manifest V3** - Соответствие последним стандартам
- **VueUse** - Мощные композиционные утилиты
- **Vitest** - Быстрое unit тестирование

## 📋 Функционал

✅ **Счетчик новых сообщений** рядом с уведомлениями DTF.ru  
✅ **Список каналов** с поиском и сортировкой  
✅ **Интерфейс чата** с поддержкой медиа  
✅ **Отправка сообщений** и прикрепление файлов  
✅ **Кнопка "Написать"** на страницах профилей  
✅ **Browser notifications** о новых сообщениях  
✅ **Автоматическая смена темы** (светлая/темная)  
✅ **Responsive дизайн** для всех разрешений

## 🛠 Установка

### Требования

- Node.js 18+
- npm или yarn
- Chrome/Chromium браузер

### Установка зависимостей

```bash
# Клонировать репозиторий
git clone https://github.com/your-repo/dtf-messenger-extension.git
cd dtf-messenger-extension

# Установить зависимости
npm install
```

### Разработка

```bash
# Запуск в режиме разработки (hot reload)
npm run dev

# Сборка для production
npm run build

# Сборка для разработки
npm run build:dev

# Запуск тестов
npm run test

# Запуск тестов с UI
npm run test:ui

# Проверка типов
npm run type-check

# Линтинг
npm run lint
```

## 🔧 Установка расширения в браузер

### Режим разработчика

1. Соберите проект: `npm run build:dev`
2. Откройте Chrome и перейдите в `chrome://extensions/`
3. Включите "Режим разработчика" (Developer mode)
4. Нажмите "Загрузить распакованное расширение" (Load unpacked)
5. Выберите папку `dist` в корне проекта
6. Расширение установится и появится в списке

### Hot Reload во время разработки

```bash
# В одном терминале запустите watch режим
npm run dev

# Расширение будет автоматически пересобираться при изменениях
# Перезагрузите расширение в chrome://extensions/ для применения изменений
```

## 📁 Структура проекта

```
dtf-messenger-extension/
├── src/
│   ├── content/              # Content Scripts
│   │   ├── main.ts          # Основной content script
│   │   ├── App.vue          # Главный Vue компонент
│   │   └── styles.css       # Глобальные стили
│   ├── background/          # Service Worker
│   │   └── service-worker.ts
│   ├── popup/               # Popup окно
│   │   └── index.html
│   ├── components/          # Vue компоненты
│   │   ├── ChatButton/
│   │   ├── ChannelsList/
│   │   ├── ChatSidebar/
│   │   ├── MessageList/
│   │   └── MessageInput/
│   ├── composables/         # Vue composables
│   │   ├── useAuth.ts
│   │   ├── useAPI.ts
│   │   └── useNotifications.ts
│   ├── stores/              # Pinia stores
│   │   ├── auth.ts
│   │   ├── channels.ts
│   │   ├── messages.ts
│   │   └── ui.ts
│   ├── utils/               # Утилиты
│   │   ├── api.ts
│   │   └── date.ts
│   └── types/               # TypeScript типы
│       ├── api.ts
│       ├── channel.ts
│       └── message.ts
├── public/
│   ├── manifest.json        # Chrome Extension manifest
│   └── icons/               # Иконки расширения
├── tests/
│   ├── unit/                # Unit тесты
│   └── e2e/                 # E2E тесты (Cypress)
└── docs/                    # Документация
```

## 🧪 Тестирование

```bash
# Unit тесты
npm run test

# Тесты с покрытием
npm run test:coverage

# UI для тестов
npm run test:ui

# E2E тесты (когда будут настроены)
npm run test:e2e
```

## 🎨 Стилизация

Проект использует Tailwind CSS с кастомной цветовой схемой DTF.ru:

```css
/* Основные цвета */
--dtf-primary: #8000ff
--dtf-background-light: #ffffff
--dtf-background-dark: #1a1a1a
--dtf-text-light: #333333
--dtf-text-dark: #ffffff
```

### Автоматическая смена темы

Расширение автоматически переключается между светлой и темной темой в зависимости от системных настроек пользователя.

## 🔐 Безопасность

- **Content Security Policy** - защита от XSS атак
- **Минимальные permissions** - только необходимые разрешения
- **Безопасное хранение токенов** - через Chrome Storage API
- **HTTPS only** - все API запросы через защищенное соединение

## 📱 Совместимость

- **Chrome** 88+
- **Edge** 88+
- **Другие Chromium браузеры**

## 🚀 Развертывание

### Подготовка к публикации

```bash
# Сборка для production
npm run build

# Создание zip архива для Chrome Web Store
cd dist && zip -r ../dtf-messenger-extension.zip .
```

### Chrome Web Store

1. Зарегистрируйтесь как разработчик в [Chrome Web Store](https://chrome.google.com/webstore/developer/dashboard)
2. Создайте новое приложение
3. Загрузите zip файл из папки `dist`
4. Заполните описание, скриншоты и другие метаданные
5. Отправьте на модерацию

## 🤝 Разработка

### Добавление нового компонента

1. Создайте папку в `src/components/`
2. Добавьте `.vue` файл с компонентом
3. Экспортируйте из `index.ts` если нужно
4. Добавьте unit тесты в `tests/unit/`

### Добавление нового store

1. Создайте файл в `src/stores/`
2. Используйте Pinia Composition API
3. Добавьте типизацию для всех состояний
4. Покройте тестами основную логику

### Код стайл

- Используйте TypeScript для всех файлов
- Следуйте Vue 3 Composition API
- Применяйте ESLint правила
- Пишите тесты для новой функциональности

## 📝 Лицензия

MIT License - подробности в файле [LICENSE](LICENSE)

## 🆘 Поддержка

- **Issues** - [GitHub Issues](https://github.com/your-repo/dtf-messenger-extension/issues)
- **Документация** - [Wiki](https://github.com/your-repo/dtf-messenger-extension/wiki)
- **Чат** - [Discord/Telegram](link)

---

### Статус разработки

- ✅ Архитектура и настройка проекта
- 🚧 API интеграция и аутентификация
- 🚧 UI компоненты
- ⏳ Тестирование
- ⏳ Публикация в Chrome Web Store

**Версия:** 1.0.0  
**Последнее обновление:** $(date)
