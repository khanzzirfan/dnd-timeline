````markdown
# Publishing dnd-timeline-extended to npm

This guide explains how to publish the `dnd-timeline-extended` package to the npm registry.

## Prerequisites

- You must have an [npm](https://www.npmjs.com/) account.
- You must be a maintainer of the `dnd-timeline-extended` package on npm (or publishing for the first time).
- Ensure you have the latest code and your changes are committed.
- Make sure the package version in `packages/dnd-timeline/package.json` is updated (npm will not publish if the version is unchanged).

## Steps

### 1. Install dependencies (if not already done)

```
pnpm install
```

### 2. Build the package

```
cd packages/dnd-timeline
pnpm run build
```

### 3. Log in to npm (if not already logged in)

```
npm login
```

Follow the prompts to enter your npm username, password, and email.

### 4. Publish the package

```
npm publish --access public
```

> **Note:**
>
> - If you see a message about the version already being published, update the `version` field in `package.json` and rebuild.
> - If you are publishing a scoped package (e.g., `@your-scope/dnd-timeline-extended`), you may need to use `--access public`.

### 5. Verify the package

After publishing, check the [npm package page](https://www.npmjs.com/package/dnd-timeline-extended) to verify your new version is available.

## Troubleshooting

- **Not authorized to publish:**
  - Make sure you are logged in with the correct npm account.
  - Ensure you have permission to publish this package.
- **Version already exists:**
  - Update the `version` in `package.json` (use [semver](https://semver.org/)), rebuild, and try again.
- **2FA enabled:**
  - You may be prompted for a one-time password (OTP) from your authenticator app.

## Example Full Command Sequence

```
pnpm install
cd packages/dnd-timeline
pnpm run build
npm login
npm publish --access public
```

---

For more details, see the [npm publishing docs](https://docs.npmjs.com/cli/v10/commands/npm-publish).
````
