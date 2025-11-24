# TypeScript project

This repository is set up with a minimal TypeScript project structure.

Available npm scripts:

- `npm run build` — compile TypeScript from `src` to `dist` using `tsc`.
- `npm run start` — run the compiled output (`node dist/index.js`).
- `npm run dev` — run the TypeScript source directly with `ts-node`.
- `npm run clean` — remove `dist` directory.

Quick start:

```bash
npm install --save-dev typescript ts-node @types/node
npm run build
npm run start
```

Or for development:

```bash
npm install --save-dev typescript ts-node @types/node
npm run dev
```
