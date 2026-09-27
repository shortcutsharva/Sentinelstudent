# Mobile Tooling

This folder uses the Expo and React Native ecosystem with TypeScript. This guide covers the development toolchain, dependencies, and available commands only.

## Languages and runtime

- **TypeScript** — strict type checking is enabled; `@/*` aliases to `src/*`.
- **Node.js and npm** — npm dependencies and scripts are declared in `package.json`; `package-lock.json` records the resolved dependency tree. No Node.js or npm version is specified.
- **React 19** and **React Native 0.86** — UI framework and native runtime dependencies.
- **Expo SDK 57** — managed development tooling and native modules.

## Frameworks and libraries

| Tool | Use in the development stack |
| --- | --- |
| Expo Router | File-based routing and app entry point (`expo-router/entry`) |
| React Navigation | Navigation packages used alongside Expo Router |
| Metro | Configured bundler for web in `app.json` |
| React Native Web | Web platform support |
| ESLint 9 with `eslint-config-expo` | Linting using Expo's flat configuration |
| Axios | HTTP client library |
| Expo Audio, File System, Font, Asset, Linking, Constants, and Status Bar | Expo platform modules |
| React Native Screens and Safe Area Context | Native navigation and layout support |
| Expo Vector Icons | Icon library |

The Expo configuration declares iOS, Android, and web platforms. `expo-audio` is configured with an app microphone-permission message.

## External services and environment variables

The mobile package calls external service APIs. These services are not installed as npm packages:

- **Google Gemini API** — `EXPO_PUBLIC_GEMINI_API_KEY`
- **Sarvam AI API** — `EXPO_PUBLIC_SARVAM_API_KEY`
- **Shared API base URL** — `EXPO_PUBLIC_API_URL`

Provide any required values through the Expo environment configuration used for local development. Do not commit API keys or other secrets.

## Setup and commands

Install dependencies from this directory:

```bash
npm install
```

Available npm scripts:

```bash
npm start       # Start the Expo development server
npm run android # Start with the Android target
npm run ios     # Start with the iOS target
npm run web     # Start with the web target
npm run lint    # Run Expo lint
```

## Configuration files

- `package.json` — npm dependencies, development dependencies, and scripts.
- `package-lock.json` — npm lockfile.
- `app.json` — Expo app, platform, plugin, and bundler settings.
- `tsconfig.json` — TypeScript compiler settings.
- `eslint.config.js` — ESLint configuration.
