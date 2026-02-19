# UniNest Platform

UniNest is a professional, high-performance platform designed for student housing and opportunity matching. Built with a modern tech stack and focusing on reliability and user experience.

## Architecture

The project is structured as a monorepo using **TurboRepo** and **pnpm**, allowing for shared code between the web and mobile applications while maintaining clear boundaries.

- `apps/web`: Next.js search and dashboard interface.
- `apps/mobile`: React Native / Expo application for students.
- `packages/api-client`: Shared API client logic.
- `packages/shared-types`: Standardized TypeScript definitions.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [pnpm](https://pnpm.io/)
- [Turbo](https://turbo.build/)

### Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development environment:
   ```bash
   pnpm dev
   ```

   Followed by specific filters if needed:
   - `pnpm dev:web`
   - `pnpm dev:mobile`

## Documentation

Comprehensive documentation can be found in the `docs/` directory:
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Platform Overview](docs/PLATFORM_OVERVIEW.md)
- [Master Plan](docs/MASTER_PLAN.md)
- [Testing Plan](docs/PRE_LAUNCH_TESTING_PLAN.md)

## Progressive Web App (PWA)

UniNest includes robust PWA support, including offline capabilities and install tracking. Asset generation and analytics integration are pre-configured for production readiness.

---

&copy; 2026 UniNest. All rights reserved.
