# Server Tooling

This folder uses Node.js and its built-in modules. This guide documents the runtime, package setup, and available command only.

## Language and runtime

- **JavaScript** using native **ES modules** (`.mjs` and `import` syntax).
- **Node.js** — the package start script runs `node index.mjs`. No Node.js version is specified.
- **Node.js built-in modules** — `node:http`, `node:fs`, `node:path`, and `node:url`.
- **JSON** — used for the package manifest and local data files.

## Dependencies

`package.json` declares no third-party dependencies or development dependencies. No lockfile or separate build, test, or lint configuration is present in this folder.

## Setup and command

Run from this directory:

```bash
npm run start
```

The start script is defined in `package.json` as `node index.mjs`. The server port can be set using the `PORT` environment variable; the default in the current configuration is `3000`.

## Configuration file

- `package.json` — package metadata, native ES module setting, and start script.
