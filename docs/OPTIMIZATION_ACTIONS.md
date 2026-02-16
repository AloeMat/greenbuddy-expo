# Phase 5.1b - Concrete Optimization Actions

## Quick Wins Identified 🎯

### 1. Logger Service Optimization
**Status**: logPerformance & logUserAction barely used
- [ ] Check actual usage in codebase
- [ ] Keep logger.ts core methods (debug, info, warn, error, critical)
- [ ] Consider removing logPerformance/logUserAction if not actively used
- [ ] Impact: -5KB

### 2. Conditional Sentry Initialization
**Current**: Sentry imported and used everywhere
**Optimization**: Initialize only in production builds

```typescript
// Before: Always imports & initializes Sentry
import * as Sentry from '@sentry/react-native';

// After: Conditional import
const Sentry = __DEV__ ? null : require('@sentry/react-native');
```

**Impact**: -300KB dev bundle (removed from dev build)

### 3. Remove Unused Service Exports
Services to audit:
- [ ] dataSync.ts - Check GuestSession interface usage
- [ ] weather.ts - WeatherData usage
- [ ] plantnet.ts - PlantIdentificationResult usage

**Impact**: -10-15KB

### 4. Optimize Package.json Scripts
- [ ] Remove unused npm scripts
- [ ] Check devDependencies (remove if not needed for production)

### 5. Image Asset Optimization
**Current**: PNG/JPG avatars
**Target**: .webp conversion + compression

Files to optimize:
- [ ] assets/avatars/ → convert to .webp
- [ ] assets/icons/ → optimize SVG
- [ ] splash screen → compress PNG

**Estimated Savings**: -500KB - 1MB

### 6. Lazy Load Onboarding
**Current**: Loaded with main app bundle
**Target**: Separate chunk loaded only when onboarding triggered

```typescript
// Before
import OnboardingFlow from './app/onboarding';

// After
const OnboardingFlow = React.lazy(() => import('./app/onboarding'));
```

**Impact**: -500KB from main bundle (moved to separate chunk)

## Implementation Priority

### HIGH (Do Today - 2-3 hours)
1. ✅ Conditional Sentry (-300KB dev)
2. ✅ Remove unused logger exports (-5KB)
3. ✅ Audit & remove dead service functions (-20KB)

### MEDIUM (Do This Week - 3-4 hours)
4. ⏳ Image optimization (-500KB to 1MB)
5. ⏳ Lazy load onboarding (-500KB main bundle)

### LOW (Polish - 1-2 hours)
6. ⏳ Virtual scrolling for lists
7. ⏳ Memoize heavy components
8. ⏳ Clean up unused constants

## Expected Bundle Size Impact

**Before Optimization:**
- Main Bundle: ~12MB (Android)
- Dev Bundle: ~15MB

**After Optimization:**
- Main Bundle: ~9.5MB (-21%)
- Dev Bundle: ~9MB (-40%)
- Image Assets: -40%

## Concrete Next Steps

### Step 1: Conditional Sentry (NEXT)
Edit services/logger.ts:
```typescript
// Add conditional import at top
const Sentry = __DEV__ ? null : require('@sentry/react-native');

// Wrap Sentry calls with null check
if (Sentry && isProd) {
  Sentry.addBreadcrumb(...);
}
```

### Step 2: Remove Dead Code
- Find all `console.log()` statements → remove
- Find unused imports → remove
- Check for duplicate implementations

### Step 3: Image Assets
```bash
# Find all image files
find assets/ -type f \( -name "*.png" -o -name "*.jpg" \)

# Convert to webp (install cwebp first)
cwebp image.png -o image.webp -q 80
```

### Step 4: Lazy Load Critical Screens
```typescript
// app/_layout.tsx or app/(tabs)/_layout.tsx
const AchievementsScreen = React.lazy(() =>
  import('./achievements')
);
```

## Tools for Analysis

### Bundle Size Analysis
```bash
# See what's in the bundle
npx expo prebuild --clean
cd ios && pod install && cd ..
ls -lh build/
```

### Tree Shaking Check
```bash
# Check if tree-shaking is working
grep -r "export const unused" services/
```

### Memory Profiling
```bash
# Android
adb shell am dumpheap <pid> /data/heap.dump
adb pull /data/heap.dump

# iOS
Xcode → Instruments → Allocations
```

## Success Metrics

✅ Tree-shaking removes dead code
✅ Image assets compressed by 40%
✅ Dev bundle reduced by 30%+
✅ App launch time < 3 seconds
✅ Memory footprint < 150MB

---

**Status**: Planning phase - Ready to implement

**Estimated Time**: 3-4 hours for all optimizations

**Next Action**: Start with Conditional Sentry implementation
