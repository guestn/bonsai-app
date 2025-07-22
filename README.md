# Puffer Frontend App Template

This is a template for developer frontend apps at Puffer. It includes all the necessary packages to create a DeFi app.

## Setup

To complete the setup, make sure to add the `NPM_TOKEN` environment variable to your GitHub Actions secrets to be able to install Puffer private packages in the CI/CD pipeline.

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
- **UI base components:** [Puffer UI Components](https://github.com/PufferFinance/puffer-ui-components)
- **Unit Testing:** React Testing Library
- **E2E Testing:** Playwright (TBC)
- **Linting:** ESLint / Prettier / Stylelint
- **Internationalization:** i18next
- **CSS:** SCSS Modules

## Environment variables

Environment variables are stored in the `.env` file and should be prefixed with `VITE_PUBLIC_`, if they are public variables. To access them in the code, use `meta.env.VITE_PUBLIC_VARIABLE_NAME` instead of `process.env.VITE_PUBLIC_VARIABLE_NAME`.

## Release

### Release setup (one-time)

<details>

<summary>View details</summary>

> **IMPORTANT**
>
> - This is needed only if the default branch is protected from direct pushes.
> - It's important to use rulesets instead of the legacy branch protection feature as the latter doesn't support bypassing for deploy keys.

Before the release process can work, we need to set up a deploy key in the repository settings.

1. Ask the team for the SSH deploy key with write permissions or create one yourself. The SSH key has to be created with an empty passphrase.

   ```sh
   ssh-keygen -t ed25519 -C "admin@puffer.fi" -N "" -f ./file-name
   ```

2. Add the private SSH key in a GitHub repository secret named `RELEASE_DEPLOY_KEY`.
   - Settings -> Secrets and variables -> Actions -> New repository secret
3. Go to the "Deploy keys" section of the repository and add the public SSH key there.
   - Settings -> Deploy keys -> Add deploy key
4. Navigate to the ruleset for the main branch protection and add "Deploy keys" to the bypass list.
   - Settings -> Rules -> Rulesets -> \<branch-protection-ruleset\> -> Bypass list -> Deploy keys
5. Now the [release.yaml](.github/workflows/release.yaml) workflow will checkout the repository using the deploy key.

</details>

### Release process

The app can be released manually or by running the [release.yaml](.github/workflows/release.yaml) GitHub Actions workflow.

1. To release manually, run the following command.

   ```bash
   pnpm release --increment <patch|minor|major|prepatch|preminor|premajor>
   ```

2. To release using the [release.yaml](.github/workflows/release.yaml) workflow, go to the [release workflow page](../../actions/workflows/release.yaml) and click on the "Run workflow" button.

Each release will automatically create a git tag and a GitHub release. The GitHub release notes will include all the pull requests merged between the last release and the current release.

## Project directory structure

### Top Level

```text
.
└── src/
    ├── lib/
    ├── components/
    │   └── domain/                   — Logical domain components
    └── pages/
        ├── main-page
        └── secondary-page
```

### Component/Page Level

```text
.
└── component-name/
    ├── lib/
    │   ├── constants.ts
    │   ├── type.ts
    │   ├── functions.ts
    │   └── ...                       — There could be more files if `functions.ts` gets too big.
    ├── __test__/
    │   ├── component-name.spec.tsx
    │   ├── functions.spec.tsx
    │   └── ...
    ├── component-name.module.scss
    └── component-name.tsx
```

### Public Files/Assets

```text
.
└── public/
    ├── images/
    │   └── image.jpg
    ├── favicon/
    └── ...
```

## Feature Flags

The application implements a hierarchical feature flag system that allows dynamic feature toggling through multiple configuration layers. Feature flags can be enabled through the following methods, listed in order of precedence (highest to lowest):

1. **Query Parameters**

   - Format: `?feature_FEATURE_ID=true`
   - Example: `https://app.puffer.fi/?feature_EXAMPLE_FEATURE=true`

2. **Browser Local Storage**

   - Key format: `feature_FEATURE_ID`
   - Example: `feature_EXAMPLE_FEATURE: true`

3. **Environment Variables**
   - Format: `VITE_FEATURE_FEATURE_ID=true`
   - Example: `VITE_FEATURE_EXAMPLE_FEATURE=true`

For React components, use the `useFeatureService` hook to check feature flag states and conditionally render features.

See `src/features/feature-flags.ts` for available feature flags and their default configurations.
