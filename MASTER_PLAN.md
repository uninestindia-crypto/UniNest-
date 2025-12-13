# Uninest Project Master Plan & Roadmap

> **FILE PURPOSE**: This document serves as the **Single Source of Truth** for the Uninest project. It includes the "Super Prompt" context for AI agents, a summary of completed MVP work, and the detailed roadmap for future phases.

---

## 🤖 AI Agent "Super Prompt" & Context

**SYSTEM ROLE**: You are an expert Senior React Native & Full Stack Developer. You prioritize clean architecture, strict type safety, and premium design aesthetics.

### 1. Technology Stack (STRICT)
- **Monorepo**: Turborepo (`apps/mobile`, `apps/web`, `packages/*`).
- **Mobile**: Expo SDK 52 (Managed), Expo Router v4.
- **State**: React Query v5 (Server) + Zustand (Client).
- **Styling**: `StyleSheet.create` with Custom Theme design tokens. **NO Tailwind** in mobile.
- **Language**: TypeScript (Strict).
- **Backend**: Supabase (Auth, Postgres, Realtime, Storage).
- **Form Handling**: `react-hook-form` + `zod`.
- **Testing**: Jest + `@testing-library/react-native`.

### 2. Design Aesthetics & UX Rules
- **Premium Feel**: Use vibrant colors (Indigo/Violet primaries), glassmorphism where appropriate, and smooth transitions.
- **Micro-animations**: Use `react-native-reanimated` for layout transitions and press interactions.
- **Tactile Feedback**: Use `expo-haptics` on all interactive elements.
- **Feedback Loops**: Always show loading skeletons, active states, and error boundaries.

### 3. Implementation Workflow
1.  **Plan**: Check `MASTER_PLAN.md` and `implementation_plan.md`.
2.  **Verify**: Check existing shared packages (`@uninest/api-client`, `@uninest/shared-types`) before creating new types/api calls.
3.  **Build**: Create reusable components in `components/ui/` first.
4.  **Test**: Write unit tests for logic and critical UI.

---

## 📅 Roadmap Overview

| Phase | Focus | Status | Description |
|-------|-------|--------|-------------|
| **Phase 1** | **MVP Core** | ✅ **COMPLETE** | Auth, Profile, Listings, Booking, Basic Components. |
| **Phase 2** | **Community** | ⬜ PENDING | Social Feed, Comments, User Interaction. |
| **Phase 3** | **Growth** | ⬜ PENDING | Donations, Premium Listings, Advanced Analytics. |
| **Phase 4** | **Intelligence** | ⬜ PENDING | AI Housing Recommendations, Smart Chatbot. |

---

## ✅ Phase 1: MVP Core (Completed)

**Goal**: Production-ready mobile application for App Store submission.

### Key Achievements
*   **Architecture**: Monorepo setup with shared API/Types packages.
*   **Component System**: Reusable `Button`, `Input`, `Card`, `Avatar` with variants.
*   **Production Hardening**: Sentry integration, Offline Mutation Queue, FlashList optimization.
*   **Testing**: Unit test suite for critical paths.

### Artifacts Created
*   `apps/mobile/components/ui/*`: Core UI library.
*   `apps/mobile/services/*`: Analytics, Sentry, OfflineQueue.
*   `apps/mobile/assets/`: Generated App Icon and Splash Screen.

---

## 🚀 Phase 2: Community & Engagement (Next Up)

**Goal**: Transform the app from a utility to a community platform for students.

### 2.1 Social Feed (`apps/mobile/app/social/`)
*   [ ] **Feed Interface**: Implementation of `FlashList` for high-performance scrolling of posts.
*   [ ] **Post Creation**: Rich text input with image upload (Supabase Storage).
*   [ ] **Interactions**: Like, Comment, and Share functionality.
*   [ ] **Topics/Tags**: Filtering feed by "Housing", "Events", "Academic".

### 2.2 User Profiles Enhanced
*   [ ] **Public Profiles**: View other users' posts and listings.
*   [ ] **Follow System**: Ability to follow content creators or friends.
*   [ ] **Badges**: Display 'Verified Student', 'Top Seller' badges on profiles.

### 2.3 Real-time Notifications
*   [ ] **Supabase Realtime**: Listen for new likes/comments.
*   [ ] **Push Notifications**: Deep linking to specific posts.

---

## 💰 Phase 3: Monetization & Growth

**Goal**: Implement revenue streams and advanced vendor tools.

### 3.1 Donation System (`apps/mobile/app/donate/`)
*   [ ] **Razorpay Integration**: Native payment gateway for donations.
*   [ ] **Campaigns**: specific fundraising goals (e.g., "Student Relief Fund").
*   [ ] **Donation History**: User dashboard for tax/receipts.

### 3.2 Premium Vendor Tools
*   [ ] **Vendor Analytics Dashboard**: Graphs for views, clicks, and conversion rates.
*   [ ] **Featured Listings**: Paid placement for hostels/products.
*   [ ] **Automated Replies**: Quick-reply templates for vendors.

---

## 🧠 Phase 4: Intelligence (AI Features)

**Goal**: Leverage AI to improve user experience and matching.

### 4.1 AI Housing Matchmaker
*   [ ] **Recommendation Engine**: Analyze user preferences (budget, location, amenities) to suggest hostels.
*   [ ] **Vector Search**: Use `pgvector` on Supabase to find "similar listings".

### 4.2 Smart Assistant
*   [ ] **Chatbot Interface**: Help users navigate the app or find products.
*   [ ] **Image Analysis**: Auto-tagging uploaded images (e.g., detecting "Bedroom", "Kitchen").

---

## 🛠 Maintenance & Tech Debt Checklist

*   [ ] **Documentation**: Maintain `MASTER_PLAN.md` as features evolve.
*   [ ] **Testing**: Increase test coverage to >80% for new features.
*   [ ] **Dependencies**: Quarterly audit of npm packages.
