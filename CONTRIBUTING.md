# Contributing to create-nextjs-dapp

Thanks for your interest in contributing! This document outlines how to contribute to this project.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/create-nextjs-dapp.git
   cd create-nextjs-dapp
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development

### Building

```bash
npm run build
```

### Testing locally

```bash
npm run build
node dist/index.js
```

Or use npm link for global testing:

```bash
npm link
create-nextjs-dapp
```

### Project Structure

```
create-nextjs-dapp/
├── src/
│   └── index.ts          # CLI entry point
├── templates/
│   ├── base/             # Shared base template files
│   └── evm/              # EVM wallet provider templates
│       ├── rainbowkit/
│       ├── privy/
│       ├── dynamic/
│       └── reown/
└── dist/                 # Build output
```

## Adding a New Wallet Provider

1. Create a new directory under `templates/evm/your-provider/`
2. Add the required files (typically `components/Header.tsx`, `app/layout.tsx`, etc.)
3. Update `src/index.ts` to include the new provider option
4. Test the template generation locally
5. Submit a PR with documentation

## Submitting Changes

1. Ensure your code builds without errors:
   ```bash
   npm run build
   ```

2. Commit your changes with a descriptive message:
   ```bash
   git commit -m "feat: add support for new wallet provider"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request against the `main` branch

## Pull Request Guidelines

- Keep PRs focused on a single change
- Include a clear description of what the PR does
- Update documentation if needed
- Ensure CI checks pass

## Commit Message Format

We follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring

## Code of Conduct

Be respectful and inclusive. We're all here to build something useful together.

## Questions?

Open an issue if you have questions or need help getting started.
