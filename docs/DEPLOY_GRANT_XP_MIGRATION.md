# Deployment Guide: grant-xp Atomic RPC Migration

## 📌 Status

**Migration File:** `supabase/migrations/20260221_grant_xp_atomic_rpc.sql`
**Edge Function:** `supabase/functions/grant-xp/index.ts` (refactored)
**Commit:** 7e8cc71

**Status:** Ready for deployment ✅

---

## ⚠️ Known Issue

Supabase CLI has existing migrations from 20260204 that are already applied to remote but CLI cannot detect them. This causes `supabase db push` to fail with:

```
ERROR: duplicate key value violates unique constraint "schema_migrations_pkey"
Key (version)=(20260204) already exists.
```

**Solution:** Apply migration 20260221 directly via Supabase Dashboard or psql

---

## 🚀 Deployment Options

### Option 1: Supabase Dashboard (Recommended)
1. Go to: https://supabase.com/dashboard/project/[PROJECT_ID]/sql
2. Copy entire contents of `supabase/migrations/20260221_grant_xp_atomic_rpc.sql`
3. Paste into SQL Editor
4. Click "Run" button
5. Verify output: `CREATE FUNCTION` should complete with no errors

### Option 2: psql CLI
```bash
# Install psql if needed
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client

# Set environment variables
export PGHOST=db.[PROJECT_ID].supabase.co
export PGPORT=5432
export PGUSER=postgres
export PGDATABASE=postgres
export PGPASSWORD=[POSTGRES_PASSWORD]

# Run migration
psql -f supabase/migrations/20260221_grant_xp_atomic_rpc.sql

# Verify function exists
psql -c "SELECT proname FROM pg_proc WHERE proname = 'grant_xp_atomic';"
# Should return: grant_xp_atomic
```

### Option 3: Update Supabase CLI (Future)
```bash
# Update CLI to latest version
supabase update

# Try again
supabase migration up --linked
```

---

## ✅ Verification

After applying migration, verify the function exists:

```sql
-- Check if function exists
SELECT
  p.proname,
  pg_catalog.pg_get_functiondef(p.oid) as definition
FROM pg_catalog.pg_proc p
WHERE p.proname = 'grant_xp_atomic';

-- Expected output:
-- CREATE OR REPLACE FUNCTION public.grant_xp_atomic(...)
```

Or test directly:

```sql
-- Test with dummy data
SELECT * FROM grant_xp_atomic(
  '00000000-0000-0000-0000-000000000001'::uuid,
  10,
  'test_action'
);

-- Expected response:
-- success | new_xp | new_level | leveled_up | error_message
-- --------|--------|-----------|------------|---------------
-- t       | 10     | 1         | f          | (null)
```

---

## 📋 Post-Deployment Checklist

- [ ] Migration applied successfully (no SQL errors)
- [ ] Function `grant_xp_atomic` exists in database
- [ ] Edge Function code updated (7e8cc71 commit)
- [ ] E2E tests pass: `npm run test:e2e` (56/56)
- [ ] Manual test: Grant XP to new user (should INSERT + return success)
- [ ] Manual test: Grant XP to existing user (should UPDATE + return success)
- [ ] Monitor production logs for 24h
- [ ] Verify audit logs show correct XP grants

---

## 🔄 Rollback Plan

If issues occur:

1. **Revert Edge Function** (restore from git commit before 7e8cc71)
   ```bash
   git revert 7e8cc71
   git push origin main
   # Deploy old version
   ```

2. **Keep Migration** (it's backward compatible)
   - The RPC function doesn't affect old code
   - Old sequential approach still works if needed

3. **Monitor** for 24h to ensure stability

---

## 📞 Support

If migration fails:
- Check database logs: Supabase Dashboard → Logs
- Verify Postgres version: `SELECT version();`
- Ensure user role has necessary permissions
- Check for conflicting function names: `SELECT proname FROM pg_proc WHERE proname LIKE 'grant%';`

---

## 🎯 Timeline

- **Feb 21, 2026**: Migration created + Edge Function refactored (Commit 7e8cc71)
- **Feb 21, 2026**: Apply migration (THIS STEP)
- **Feb 21, 2026**: Deploy updated Edge Function
- **Feb 22+, 2026**: Monitor production + gather metrics

---

## 📚 Related Files

- Implementation: `supabase/migrations/20260221_grant_xp_atomic_rpc.sql`
- Tests: `docs/REFACTOR_GRANT_XP_ATOMIC.md`
- Code changes: `supabase/functions/grant-xp/index.ts`
- Commit: 7e8cc71
