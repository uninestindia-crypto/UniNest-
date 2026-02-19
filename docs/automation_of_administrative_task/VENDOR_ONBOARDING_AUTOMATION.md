# Report: Automating Vendor Onboarding Workflow

## Overview
This report provides a technical roadmap for automating the vendor onboarding process using data from Google Maps and Excel files. The goal is to minimize manual entry and automate initial outreach via Email and WhatsApp.

---

## 1. Data Sourcing & Extraction

### A. Extracting from Google Maps
To get details like vendor name, address, and phone number from Google Maps:
- **Tool**: [Outscraper](https://outscraper.com/) or [PhantomBuster](https://phantombuster.com/).
- **API**: Google Places API (higher cost but more structured).
- **Process**: Search for keywords like "Hostels", "PG for Students", "Rental Apartments" in specific coordinates.

### B. Uploading via Excel
For provided data, a central ingestion point is needed:
- **Feature**: A "Bulk Upload" button in the Admin Dashboard.
- **Tech**: Use `xlsx` or `papaparse` libraries in the Next.js admin panel to parse files and save them to Supabase as "Leads".

---

## 2. Automated Communication Layer

### A. Automatic Mailing
Once a lead is added, trigger an introductory email:
- **Tool**: **SendGrid** or **Resend**.
- **Email Design**: Use a premium template highlighting the benefits of UniNest (more bookings, lower vacancy).
- **Automation**: Use a Supabase Edge Function with a `database-webhook` to send the email immediately after a new record is inserted into the `vendor_leads` table.

### B. WhatsApp Automation
WhatsApp is the primary communication channel for vendors in many regions:
- **Option 1 (Official)**: **Twilio WhatsApp Business API**. Highly reliable, requires template approval.
- **Option 2 (Low Cost)**: **Interakt** or **Wati.io**. Designed for marketing automation with "No-Code" workflow builders.
- **Action**: When a lead is tagged as "Interested" (e.g., they clicked the link in the email), a WhatsApp message is sent automatically with the registration link.

---

## 3. End-to-End Workflow (Proposed Stack)

| Step | Tool | Action |
|------|------|--------|
| **Ingest** | Google Maps / Excel | Data enters Supabase `vendor_leads` |
| **Enrich** | AI Agent | Auto-categorize hostel type/category |
| **Step 1 Outreach** | Resend (Email) | Welcome email with onboarding video |
| **Wait** | 24 Hours | System waits for a response or a link click |
| **Step 2 Outreach** | Wati (WhatsApp) | "Hi [Name], we saw you checked out the link! Need help setting up your first listing?" |
| **Onboard** | Platform UI | Vendor completes profile and listing |

---

## 4. Implementation Priorities

1. **Phase 1 (The Lead Repository)**: Create a `leads` table in Supabase and build the Excel upload tool in the admin panel.
2. **Phase 2 (Mail Integration)**: Connect Resend to send an "Invite to Join" email automatically.
3. **Phase 3 (WhatsApp)**: Integrate a WhatsApp provider for high-converting follow-ups.

---

## Potential Challenges
- **Data Quality**: Phone numbers from Google Maps might be landlines (not WhatsApp compatible).
- **Anti-Spam**: Automated messaging must be personalized and spaced out to avoid account bans.
