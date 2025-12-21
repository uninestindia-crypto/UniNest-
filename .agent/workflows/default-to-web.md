---
description: Default to web app for code changes in this monorepo
---

# Project Context

This is a **monorepo** with two apps:
- `apps/web` - Next.js web application (PRIMARY)
- `apps/mobile` - React Native mobile application

## Default Behavior

**Unless explicitly specified otherwise, ALL code changes should be made to the WEB app:**
- Path: `apps/web/src/`
- API routes: `apps/web/src/app/api/`
- Components: `apps/web/src/components/`
- Hooks: `apps/web/src/hooks/`
- Lib/utils: `apps/web/src/lib/`

## When to use Mobile

Only make changes to `apps/mobile/` when the user explicitly mentions:
- "mobile app"
- "React Native"
- "Expo"
- "iOS" or "Android"

## Shared Code

Shared types are in `packages/shared-types/` - changes here affect both apps.
