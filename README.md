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

Environment variables are stored in the `.env` file and should be prefixed with `VITE_`. To access them in the code, use `import.meta.env.VITE_VARIABLE_NAME`.

### Firebase Configuration

Create a `.env` file in the root directory with the following Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Seeding Firebase Database

To populate the Firebase database with mock data, you can run the seeding script:

```bash
node scripts/seed-firebase.js
```

**Note:** The `firebase.ts` file in the root directory is gitignored and contains the actual Firebase configuration. For production, use environment variables instead.
