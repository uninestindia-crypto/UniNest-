# Database Disaster Recovery & Restoration Guide

This guide provides step-by-step instructions on how to restore your UniNest Supabase backend from the codebase if the live database is ever deleted or corrupted.

## 1. Prerequisites
- Access to a new/existing Supabase Project.
- SQL Editor access in the Supabase Dashboard.

## 2. Restoration Process

### Step A: Restore Schema
1. Open the [MASTER_RESTORE_SCHEMA.sql](file:///d:/studio-uninest-deployed-main/BACKUP_RESTORE/MASTER_RESTORE_SCHEMA.sql) file.
2. Copy the entire content.
3. Go to your **Supabase Dashboard** -> **SQL Editor**.
4. Create a **New Query**, paste the code, and click **Run**.
   - *This will recreate all enums, tables, functions, policies, and indexes.*

### Step B: Verify Application Integrity
Run the following SQL check to ensure all critical tables are present:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```
Ensure you see: `profiles`, `products`, `leads`, `chat_messages`, `audit_log`, etc.

## 3. Recommended Backup Strategy (Preventive)

### Supabase CLI (Recommended)
If you have the Supabase CLI installed, run these commands regularly:
```bash
# Pull current schema from production
supabase db pull --project-ref your-project-id

# Push schema to a new environment
supabase db push
```

### Manual Export
Occasionally, export your data as CSV from the Supabase "Table Editor" for critical tables like `profiles` and `leads`.

## 4. Maintenance
> [!IMPORTANT]
> The `MASTER_RESTORE_SCHEMA.sql` is a point-in-time snapshot. If you add new columns or tables in the Supabase Dashboard, always ensure they are added to this script to maintain your "1-second recovery" capability.
