# Report: Zero-Cost AI & Automation Strategy

This report outlines a blueprint for implementing the requested features with **$0 monthly spend**, leveraging your existing use of Groq and other free-tier developer tools.

---

## 1. AI Implementation (Using Groq)
Since you are already using Groq on a rotatory basis, you can maintain zero cost by:
- **Model Choice**: Use `llama-3.1-8b-instant` for chatbots and simple logic (extremely fast and high rate limits) and `llama-3.1-70b-versatile` for complex data analysis or writing emails.
- **Integration**: Use the OpenAI-compatible SDK in your Supabase Edge Functions or Next.js API routes to call Groq.
- **Cost**: **$0** (within free tier limits).

---

## 2. Zero-Cost Vendor Onboarding Automation

### A. Data Sourcing (Google Maps)
Instead of paid scrapers like Outscraper:
- **Solution**: Use an open-source Python scraper like [Google-Maps-Scraper](https://github.com/gosom/google-maps-scraper) or a simple Selenium script.
- **Process**: Run the script locally on your machine once a month to generate an Excel/CSV file.
- **Cost**: **$0** (uses your local bandwidth/CPU).

### B. Automated Mailing
- **Solution**: **Resend (Free Tier)**.
- **Capacity**: 3,000 emails per month (100 per day).
- **Setup**: Perfect for onboarding 100 vendors/day. If you exceed this, you can use **Nodemailer** with a standard Gmail SMTP (though Gmail has a 500/day limit and strict spam filters).
- **Cost**: **$0**.

### C. Automated WhatsApp (The "Hard" Part)
Official APIs (Twilio/Wati) always have Meta fees. To stay at zero cost:
- **Option 1: `whatsapp-web.js`**: An open-source Node.js library that runs a headless Chrome instance and connects to your WhatsApp Web. You can host this on your local machine or a free-tier VPS (like Oracle Cloud's "Always Free").
- **Option 2: Personal WA Links**: In your Admin Dashboard, generate a button: `https://wa.me/[phone]?text=[encoded_message]`.
    - When your team clicks it, it opens WhatsApp with the message pre-filled.
    - **Pros**: 100% free, no risk of account bans.
    - **Cons**: Requires one click per vendor.
- **Cost**: **$0**.

---

## 3. The $0 Tech Stack Summary

| Component | Tool / Service | Cost |
|-----------|----------------|------|
| **AI Brain** | Groq (Llama 3) | $0 |
| **Email** | Resend (Free Tier) | $0 |
| **WhatsApp** | `whatsapp-web.js` (Local) | $0 |
| **Data Scraping** | Local Python Script | $0 |
| **Database** | Supabase (Free Tier) | $0 |
| **Hosting** | Vercel (Free Tier) | $0 |

---

## 4. Immediate Implementation Plan (No-Cost)

1.  **Lead Table**: Create a `vendor_leads` table in Supabase.
2.  **Excel Import**: Build a simple `.xlsx` upload component in your Admin Panel to populate this table.
3.  **Groq Agent**: Create a "Lead Evaluator" script using Groq that reads the Excel data and writes a personalized "Pitch" for each vendor.
4.  **Bulk Mailer**: Use a button in the Admin Panel to "Send All Invites" via Resend.
5.  **WhatsApp "Quick-Chat"**: Add a WhatsApp icon next to each lead that opens the pre-filled link for your onboarding team.

---

## Strategic Advice
To keep the "rotatory" Groq keys working smoothly, implement a **Key Rotator Utility** in your backend that automatically switches to the next available API key if a `429 Too Many Requests` error is received.
