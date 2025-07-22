# Bonsai App

## Setup

## Getting started

Install:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

or to e.g. run on port 4000

```bash
pnpm dev --port 4000
```

Build for deployment:

```bash
pnpm build
```

## Repo information

- **Package manager:** pnpm
- **Library:** Vite.js
- **State management:** Context API
- **Querying:** SWR
- **UI base components:** TBN
- **Unit Testing:** React Testing Library
- **E2E Testing:** Playwright (TBC)
- **Linting:** ESLint / Prettier / Stylelint
- **Internationalization:** i18next
- **CSS:** SCSS Modules

## Environment variables

Environment variables are stored in the `.env` file and should be prefixed with `VITE_PUBLIC_`, if they are public variables. To access them in the code, use `meta.env.VITE_PUBLIC_VARIABLE_NAME` instead of `process.env.VITE_PUBLIC_VARIABLE_NAME`.
