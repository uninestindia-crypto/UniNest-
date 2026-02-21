# UniNest Backup & Restoration System

This directory contains everything needed to restore the UniNest backend from scratch.

## 📁 Directory Structure

- **[MASTER_RESTORE_SCHEMA.sql](file:///d:/studio-uninest-deployed-main/BACKUP_RESTORE/MASTER_RESTORE_SCHEMA.sql)**: The ultimate SQL script that recreates all tables, enums, functions, and security rules.
- **[DISASTER_RECOVERY.md](file:///d:/studio-uninest-deployed-main/BACKUP_RESTORE/DISASTER_RECOVERY.md)**: Step-by-step documentation for the restoration process.
- **[supabase/functions/](file:///d:/studio-uninest-deployed-main/supabase/functions/)**: Local copies of your remote Edge Functions (Stripe Webhooks, Clever Actions, etc.).

## 🚀 One-Click Restoration

1. Go to **Supabase Dashboard** > **SQL Editor**.
2. Run the code in `MASTER_RESTORE_SCHEMA.sql`.
3. Your entire infrastructure is back.

> [!TIP]
> This folder should be treated as high-priority and kept in sync with any production database changes.
