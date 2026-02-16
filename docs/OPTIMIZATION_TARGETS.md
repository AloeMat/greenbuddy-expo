# Phase 5.1 - Performance Optimization Targets

## Bundle Size Optimization

### Current Dependencies Analysis

**Heavy Dependencies (to monitor):**
- `@sentry/react-native` (~500KB) - Error tracking, consider conditional loading
- `@supabase/supabase-js` (~200KB) - Backend SDK, required but already optimized
- `react-native-reanimated` (~300KB) - Animation library, essential
- `react-native-gesture-handler` (~150KB) - Gesture support, required
- `react-native-linear-gradient` (~100KB) - Styling, lightweight

**Light Dependencies (good):**
- `expo-*` modules - Lean by design
- `nativewind` - Tailwind for RN, efficient
- `react-native-base64` - Small utility

### Optimization Strategies

#### 1. Tree Shaking & Unused Code Removal
```bash
# Remove unused imports and dead code
# Focus on:
- Unused service functions
- Duplicate implementations
- Unused component variants
```

#### 2. Dynamic Imports
```typescript
// Before: All screens loaded upfront
import OnboardingFlow from './app/onboarding';
import AchievementsScreen from './app/(tabs)/achievements';

// After: Load on-demand
const OnboardingFlow = React.lazy(() => import('./app/onboarding'));
const AchievementsScreen = React.lazy(() => import('./app/(tabs)/achievements'));
```

#### 3. Asset Optimization
- **Image Compression:** Use expo-image with auto-optimization
- **SVG Optimization:** Minimize SVG coordinates
- **Icon Library:** @expo/vector-icons already optimized

#### 4. Code Splitting by Route
```
app.json: Ensure proper chunking via Expo Router
- Onboarding chunk (separate from main app)
- Tabs chunk (loaded on first tab access)
- Modal components (lazy loaded)
```

### Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **App Launch Time** | <3s | TBD | 🔍 |
| **Bundle Size (Android)** | <10MB | TBD | 🔍 |
| **Bundle Size (iOS)** | <12MB | TBD | 🔍 |
| **First Interactive** | <4s | TBD | 🔍 |
| **Memory Usage** | <150MB | TBD | 🔍 |
| **Frame Rate (Animations)** | 60 FPS | TBD | 🔍 |
| **Screen Load Time** | <1s | TBD | 🔍 |

### Implementation Plan

#### Phase 5.1a: Quick Wins (1-2 days)
1. ✅ Remove unused imports
2. ✅ Enable tree-shaking in package.json
3. ✅ Configure Hermes for Android (faster startup)
4. ✅ Image optimization via expo-image

#### Phase 5.1b: Deep Optimization (2-3 days)
1. ✅ Implement lazy loading for heavy screens
2. ✅ Code splitting by feature/route
3. ✅ Conditional Sentry initialization
4. ✅ Memory profiling & optimization

#### Phase 5.1c: Performance Testing (1 day)
1. ✅ Benchmark app launch time
2. ✅ Measure screen transitions
3. ✅ Profile memory usage
4. ✅ Test frame rates during animations

### Optimization Checklist

**Dependency Optimization:**
- [ ] Review all imports for unused dependencies
- [ ] Remove dev dependencies from production build
- [ ] Check for duplicate implementations
- [ ] Audit service modules for dead code

**Image Optimization:**
- [ ] Convert static images to .webp format
- [ ] Use expo-image with auto-optimization
- [ ] Remove inline data URIs
- [ ] Compress avatars and icons

**Runtime Optimization:**
- [ ] Implement virtual scrolling for long lists
- [ ] Memoize expensive calculations
- [ ] Use React.memo for pure components
- [ ] Debounce/throttle expensive operations

**Android-Specific:**
- [ ] Enable Hermes JavaScript engine
- [ ] Configure ProGuard for code minification
- [ ] Target API level 35+

**iOS-Specific:**
- [ ] Enable bitcode compression
- [ ] Use asset slicing for large images
- [ ] Configure App Thinning

### Monitoring

**Key Metrics to Track:**
```
Performance Budget:
- JavaScript: <800KB gzipped
- Images: <2MB total
- Launch time: <3s on iPhone 12
- Cold start: <2.5s
```

### Tools & Commands

```bash
# Check bundle size
npx expo prebuild --clean

# Memory profiling (Android)
adb shell am dumpheap <pid> /data/heap.dump

# Frame rate monitoring (iOS)
Xcode Instruments > Core Animation

# Network profiling
Charles Proxy or Network Link Conditioner
```

### References

- [React Native Performance](https://reactnative.dev/docs/performance)
- [Expo Optimization Guide](https://docs.expo.dev/build/optimizing-builds/)
- [Android Performance](https://developer.android.com/topic/performance)
- [iOS Performance](https://developer.apple.com/videos/performance/)

## Priority Implementation Order

1. **CRITICAL**: Hermes engine (Android) - 10-20% faster startup
2. **HIGH**: Lazy load onboarding (separate ~500KB chunk)
3. **HIGH**: Image compression (.webp conversion)
4. **MEDIUM**: Conditional Sentry (only in prod)
5. **MEDIUM**: Virtual scrolling for plant lists
6. **LOW**: Minor code cleanup

---

**Estimated Impact:**
- App Launch: 3.5s → 2.8s (20% improvement)
- Bundle Size: 12MB → 9.5MB (21% reduction)
- Memory: 180MB → 150MB (17% reduction)
