# Platform Overview

## Purpose
The **Studio Uninest** platform is a modern web and mobile solution designed to enable creators and vendors to showcase, manage, and sell digital and physical products. It provides a unified dashboard for administrators, vendors, and end‑users, supporting features such as product listings, booking flows, payment integration, and analytics.

## High‑Level Architecture
- **Frontend**: React Native (mobile) and Next.js (web) built with TypeScript, Tailwind CSS, and Expo.
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage) serving as the primary data layer and API gateway.
- **CI/CD**: GitHub Actions workflows (`.github/workflows/*`) automate linting, testing, and deployment to Vercel.
- **Infrastructure**: Deployed on Vercel (frontend) and Supabase cloud services (backend). Uses TurboRepo for monorepo task orchestration.

## Tech Stack
| Layer | Technology |
|-------|------------|
| **Language** | TypeScript, JavaScript |
| **Frontend Framework** | React Native, Next.js |
| **Styling** | Tailwind CSS, vanilla CSS |
| **State Management** | React Context, Zustand |
| **Backend / BaaS** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| **CI/CD** | GitHub Actions, Vercel Deployments |
| **Package Management** | pnpm (workspace) |
| **Testing** | Vitest, React Testing Library |
| **Monorepo Tooling** | TurboRepo |
| **Version Control** | Git |

## Getting Started
1. Clone the repository.
2. Install dependencies with `pnpm install`.
3. Copy `.env.example` to `.env` and fill in Supabase credentials.
4. Run the development server with `pnpm dev`.
5. For mobile, use `expo start`.

## Documentation
- Detailed API docs are in the `docs/` folder.
- Component library reference is in `src/components/`.
- CI pipelines are defined in `.github/workflows/`.

---
*This file is intended to give new contributors a quick understanding of the platform's purpose and the technologies used.*
