# ElectronIMS

ElectronIMS is a cross-platform Inventory Management System built with Electron, React, Vite, TypeScript, SQLite3, and Sequelize. It supports hot module reloading during development and can be packaged for Windows (32-bit), macOS, and Linux using electron-builder.

## 🛠 Tech Stack

- Electron – Desktop app shell
- React – UI library
- Vite – Lightning-fast build tool with HMR
- TypeScript – Static typing
- SQLite3 – Embedded database
- Sequelize – ORM for database access
- electron-builder – For packaging the app

## 📆 Project Structure

```bash
electron-ims/
├── electron/ # Electron main, preload scripts & database
├── src/ # React app (frontend)
├── dist/ # Build output (frontend)
├── release/ # Packaged executables
├── public/ # Icons and static files
├── package.json
├── vite.config.ts
└── tsconfig\*.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 22.14.0

### Install Dependencies

```bash
npm install
```

### Development (with HMR)

```bash
npm run dev
```

- Starts Vite dev server
- Watches Electron files with tsc
- Launches Electron with live reload

## 🛠 Packaging

```bash
npm run package:win # Windows
npm run package:mac # macOS
npm run package:linux # Linux
```

- Builds renderer via Vite
- Compiles Electron main/preload via TypeScript
- Creates platform-specific distributables:
- Output goes into the release/ folder.

## 📄 License

MIT – Free to use and modify.
