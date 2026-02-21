# GreenBuddy Git Workflow — Monorepo Structure

## 📌 Repository Structure

```
AloeMat/GreenBuddy.ai (monorepo)
├── greenbuddy-expo/           ← Expo/React Native app (primary focus)
├── supabase/                  ← Backend: Edge Functions + Migrations
├── docs/                      ← Project documentation
├── scripts/                   ← Build/deploy utilities
├── .github/workflows/         ← CI/CD pipelines
└── .git/                      ← Single repo for all
```

---

## 🌿 Branch Strategy

### Main Branches

| Branch | Purpose | Deploy To | Stability |
|--------|---------|-----------|-----------|
| **main** | Production release | App Store, Play Store, vercel.app | 🟢 Stable |
| **dev** | Active development | None (CI only) | 🟡 Testing |

### Feature Branches (Optional)
```
feature/fsd-audit-fixes
bugfix/camera-permissions
refactor/state-management
```

---

## 🔄 Workflow: dev → main

### 1️⃣ Development (on `dev` branch)

```bash
# Switch to dev
git checkout dev
git pull origin dev

# Create feature branch (optional, but recommended for big changes)
git checkout -b feature/my-feature

# Make changes to greenbuddy-expo/ (or supabase/)
# Commit regularly
git add greenbuddy-expo/src/features/dashboard/
git commit -m "feat(expo): Add new dashboard widget"

# Push to feature branch
git push origin feature/my-feature
```

### 2️⃣ Validation (on `dev` branch)

**Before merging to main:**

```bash
# Run tests locally
cd greenbuddy-expo
npm run test:e2e          # 56 E2E tests
npm run lint              # ESLint checks
npm run build             # Production build

# Or merge PR and let CI/CD run tests
# → .github/workflows/e2e-tests.yml runs automatically
```

**CI/CD Checks:**
- ✅ TypeScript compilation (`tsc --noEmit`)
- ✅ E2E tests (56 tests)
- ✅ ESLint (code quality)
- ✅ Build validation

### 3️⃣ Merge to Main (Release)

```bash
# On dev branch, ensure all tests pass
git status

# Create Pull Request (via GitHub UI)
# Title: "Release: v1.0.0 — FSD compliance audit fixes"
# Body: Describe changes, link to issues

# Once approved → Merge to main
git checkout main
git pull origin main
git merge --no-ff dev    # Create merge commit (traceable)
git push origin main

# Tag release
git tag -a v1.0.0 -m "v1.0.0: FSD architecture improvements"
git push origin v1.0.0
```

---

## 📝 Commit Message Format

**Use clear prefixes to indicate which part changed:**

```
# Expo app changes
feat(expo): Add dashboard alert cards to features/dashboard
fix(expo): Resolve import path for PlantRepository
refactor(expo): Migrate components to Feature-Sliced Architecture

# Backend changes
feat(supabase): Add new Edge Function for plant care
fix(supabase): Fix RLS policy for plants table

# Documentation
docs: Update FSD architecture guide
docs(expo): Document new barrel export pattern

# Infrastructure
chore: Update dependencies
ci: Configure E2E test suite
```

---

## ✅ Validation Checklist (Before Merging to main)

- [ ] All E2E tests pass: `npm run test:e2e` (56/56)
- [ ] TypeScript compilation: `npx tsc --noEmit` (0 errors)
- [ ] ESLint passes: `npx eslint src/`
- [ ] Production build succeeds: `npm run build`
- [ ] No console errors in dev
- [ ] Tested on device/simulator (iOS + Android if mobile)
- [ ] Code review approved
- [ ] PR description is clear

---

## 📊 Current Status (Feb 21, 2026)

| Item | Status | Notes |
|------|--------|-------|
| **dev branch** | 🟢 Active | 1 commit ahead of origin |
| **Last commit** | 1f5457e | refactor(fsd): Complete FSD audit fixes |
| **CI/CD** | 🟢 Passing | E2E tests: 56/56 ✅ |
| **Main branch** | 🟢 Stable | Last release: Phase 5.5 |

---

## 🚀 Deployment Targets

### Expo App
- **iOS**: TestFlight → App Store
- **Android**: EAS Build → Play Store
- **Web PWA**: Vercel (vercel.app)

### Backend
- **Supabase Edge Functions**: Automatic on deploy
- **Database Migrations**: Manual (via Supabase CLI)

---

## 🔗 Related Files

- `docs/DEPLOYMENT_STATUS.md` — Deployment status
- `docs/E2E_TESTING_GUIDE.md` — E2E testing guide
- `greenbuddy-expo/README.md` — Expo app documentation
- `.github/workflows/e2e-tests.yml` — CI/CD pipeline

---

## ❓ FAQ

**Q: Should I commit directly to main?**
A: No. Always use dev + PR workflow for traceability.

**Q: Can I commit to dev directly?**
A: Yes, for small fixes. For features, create a feature branch and PR.

**Q: What if tests fail on CI/CD?**
A: Fix locally, push new commit to branch, CI re-runs automatically.

**Q: How do I revert a commit?**
A: `git revert <commit-hash>` (creates new commit that undoes changes).

**Q: Can greenbuddy-expo be a separate repo?**
A: Not needed. Monorepo keeps frontend + backend + docs synchronized.
