# Report: Automating Student Onboarding via Instagram

## Overview
Instagram is the primary platform for student engagement. Automating interactions here can significantly increase student registration rates by providing instant gratification and guided onboarding.

---

## 1. Automation Strategies

### A. Comment-to-DM (Lead Capture)
- **Workflow**: When a student comments "INTERESTED" or "JOIN" on a post about student housing, an automated DM is sent.
- **Goal**: Instantly provide the registration link or a "Quick Guide" PDF.
- **Tool**: ManyChat or Meta Graph API.

### B. Story Mention Automation
- **Workflow**: When a student mentions @UniNest in their story (e.g., showing their new room), the system sends a "Welcome Home!" message with a referral link for their friends.
- **Goal**: Viral growth and community building.

### C. Guided Onboarding (Chatbot)
- **Workflow**: Use a multi-step DM flow to ask:
    1. "Which university are you attending?"
    2. "What is your budget range?"
    3. "Would you like to see available hostels now?"
- **Outcome**: The student is pre-qualified before they even visit the website.

---

## 2. Zero-Cost Implementation (Using Meta API & Groq)

To keep costs at $0 while remaining professional:
- **Meta Graph API**: Use the official API to listen for Webhooks (comments/mentions).
- **Groq Engine**: Pass the student's DM to Groq (Llama 3) to generate a helpful, human-like response.
- **Supabase Integration**: Save the student's Instagram handle and preferences directly to the `leads` table for follow-up.

---

## 3. Meta API Limits (2026)
- **Limit**: ~200 automated DMs per hour.
- **Restriction**: You can only message users who have interacted with you in the last 24 hours (24-hour window).
- **Safe Practice**: Always include an "Unsubscribe" or "Stop" option to avoid account flags.

---

## 4. Implementation Steps
1. **Setup Meta App**: Register a business app in the Meta Developer Portal.
2. **Webhook Listener**: Create a Supabase Edge Function to receive Instagram notifications.
3. **Response Logic**: Connect Groq to process the incoming text and determine the best response (e.g., send link vs. answer question).
4. **Platform Sync**: Automatically create a "Draft Profile" in UniNest based on the Instagram conversation.
