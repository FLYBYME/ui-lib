# UI-Lib: Scalable & Virtualized Web Components

A high-performance, lightweight UI library designed for data-heavy applications. Built with Vanilla TypeScript, optimized for speed, and featuring advanced virtualization for seamless handling of massive datasets.

## 🚀 Key Features

- **Advanced Virtualization**:
  - `VirtualList`: Handles 100k+ items with dynamic, variable heights.
  - `Table`: Row-virtualized table with sticky headers.
  - `DataGrid`: Supports both vertical (row) and horizontal (column) virtualization.
  - `VirtualGrid` & `VirtualMasonry`: Virtualized layout systems for complex data structures.
- **Reactive Architecture**:
  - Lightweight DOM diffing for optimized updates.
  - Global State Management (`Store`) for cross-component signaling.
- **SPA Ready**: Built-in client-side `Router` for dynamic navigation.
- **Form Engineering**: Virtualized `Select`, `ComboBox`, and `MultiSelect` components.
- **Infinite Loading**: Seamless data fetching with `InfiniteLoader`.

## 📦 Installation

```bash
npm install ui-lib
```

## 🛠 Usage

### Global Store
```typescript
import { Store, createStore } from 'ui-lib';

const userStore = createStore('user', { name: 'Guest' });
userStore.set({ name: 'Alexander' });
```

### Table with Virtualization
```typescript
import { Table } from 'ui-lib';

const table = new Table({
  columns: [
    { key: 'id', header: 'ID', width: '50px' },
    { key: 'name', header: 'User Name' },
  ],
  data: massiveDataset,
  height: '600px'
});
```

### Router Setup
```typescript
import { Router } from 'ui-lib';

const router = new Router([
  { path: '/', component: HomePage },
  { path: '/profile/:id', component: ProfilePage }
]);
```

## 🏗 Infrastructure

### Browser Artifacts
The library is bundled using **esbuild** for maximum performance. Artifacts are available in the `dist/` folder:
- `ui-lib.esm.js`: For modern ESM environments.
- `ui-lib.js`: IIFE bundle for direct browser inclusion.

### Docker
Build and serve the library locally using Docker:
```bash
docker build -t ui-lib .
docker run -p 8080:80 ui-lib
```

### CI/CD
Automatically builds and generates browser artifacts via **GitHub Actions** on every push.

## 📜 License
MIT
