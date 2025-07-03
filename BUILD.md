# Build System Documentation

## Overview

DTF Messenger Extension использует современную build систему на основе Vite с поддержкой Chrome Extension Manifest V3.

## Build Scripts

### Development

```bash
# Режим разработки с hot reload
npm run dev

# Одноразовая сборка для разработки
npm run build:dev

# Watch режим (без hot reload)
npm run watch
```

### Production

```bash
# Полная production сборка с валидацией
npm run build

# Создание zip архива для Chrome Web Store
npm run build:zip
```

### Utilities

```bash
# Очистка dist папки
npm run clean

# Создание placeholder иконок
npm run icons:create

# Полная настройка проекта
npm run setup
```

## Build Process

### 1. TypeScript Compilation

- Проверка типов с `vue-tsc`
- Компиляция в ES2020 для совместимости с Chrome

### 2. Vite Build

- Bundling Vue компонентов
- CSS processing с Tailwind
- Asset optimization
- Code splitting

### 3. Chrome Extension Processing

- Валидация manifest.json
- Копирование иконок
- Проверка обязательных файлов
- Создание правильной структуры папок

## Output Structure

```
dist/
├── manifest.json              # Chrome Extension manifest
├── icons/                     # Extension icons
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
├── content/                   # Content Scripts
│   ├── main.js
│   └── styles.css
├── background/                # Service Worker
│   └── service-worker.js
├── popup/                     # Popup UI
│   └── index.html
└── assets/                    # Static assets
    └── ...
```

## Development Workflow

### Initial Setup

```bash
# 1. Установка зависимостей и создание иконок
npm run setup

# 2. Запуск dev режима
npm run dev
```

### Hot Reload Process

1. **File Watcher** отслеживает изменения в `src/` и `public/`
2. **Auto Rebuild** пересобирает проект при изменениях
3. **Manual Reload** - необходимо вручную перезагрузить расширение в Chrome

### Chrome Extension Loading

1. Соберите проект: `npm run build:dev`
2. Откройте `chrome://extensions/`
3. Включите "Developer mode"
4. Нажмите "Load unpacked"
5. Выберите папку `dist`

## Build Configuration

### Vite Config Features

- **Multiple Entry Points**: content script, background, popup
- **Vue 3 Support**: SFC компоненты с TypeScript
- **Chrome Extension Compatibility**: правильные пути и форматы
- **Asset Handling**: оптимизация изображений и CSS
- **Development Mode**: отключение минификации для отладки

### Environment Variables

Создайте `.env` файл для настройки:

```env
VITE_APP_TITLE=DTF Messenger
VITE_API_BASE_URL=https://api.dtf.ru/v2.5
VITE_DEBUG=true
```

## Troubleshooting

### Common Issues

#### 1. Manifest Validation Failed

```
❌ Manifest validation failed: Invalid manifest_version
```

**Solution**: Проверьте что `public/manifest.json` имеет `manifest_version: 3`

#### 2. Missing Required Files

```
❌ content/main.js - MISSING
```

**Solution**: Убедитесь что Vite config правильно настроен и файлы компилируются

#### 3. Chrome Extension Load Error

```
Manifest file is missing or unreadable
```

**Solution**: Убедитесь что выбираете папку `dist`, а не корень проекта

#### 4. Hot Reload Not Working

- Проверьте что dev сервер запущен
- Вручную перезагрузите расширение в Chrome
- Проверьте консоль на ошибки

### Debug Mode

Для дополнительной отладки:

```bash
# Включить verbose логи
VITE_DEBUG=true npm run build:dev

# Проверить структуру файлов
npm run build && ls -la dist/
```

## Performance Optimization

### Production Build

- **Code Splitting**: автоматическое разделение кода
- **Tree Shaking**: удаление неиспользуемого кода
- **Minification**: сжатие JavaScript и CSS
- **Asset Optimization**: оптимизация изображений

### Bundle Analysis

```bash
# Анализ размера bundle
npm run build
npx vite-bundle-analyzer dist
```

## Custom Scripts

### build-extension.js

Постобработка для Chrome Extension:

- Валидация manifest
- Копирование иконок
- Проверка структуры
- Создание zip архива

### dev-reload.js

Development server с file watching:

- Мониторинг изменений
- Автоматическая пересборка
- Graceful shutdown
- Error handling

### create-icons.js

Генерация placeholder иконок:

- Все необходимые размеры
- DTF цветовая схема
- PNG формат
- Автоматическое создание папки

## Chrome Web Store Preparation

### Checklist

- [ ] Icons созданы и оптимизированы
- [ ] Manifest заполнен корректно
- [ ] Extension протестирован в Chrome
- [ ] Создан zip архив: `npm run build:zip`
- [ ] Готовы скриншоты и описания

### Submission Process

1. **Build**: `npm run build:zip`
2. **Test**: Загрузите в Chrome и протестируйте
3. **Upload**: Загрузите zip в Chrome Web Store
4. **Review**: Дождитесь модерации Google

---

**Последнее обновление**: $(date)  
**Версия build системы**: 1.0.0
