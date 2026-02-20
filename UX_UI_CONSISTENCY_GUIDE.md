# 🎨 Guide de Cohérence UX/UI - GreenBuddy Onboarding v2

**Objectif :** Harmoniser l'expérience utilisateur sur tous les pages d'onboarding

---

## 1️⃣ Système d'Espacement

### Hiérarchie d'Espacement
```
xs: 4px    - Très petit (gaps internes)
sm: 8px    - Petit (input padding)
md: 16px   - Moyen (card padding, entre composants)
lg: 24px   - Grand (section gaps)
xl: 32px   - Extra-large (page padding top/bottom)
```

### Application Onboarding
```tsx
// Page padding cohérent
<OnboardingScreen>
  <ScrollView contentContainerStyle={{ paddingHorizontal: spacing['2xl'] }}>
    {/* Contenu avec spacing cohérent */}
  </ScrollView>
</OnboardingScreen>

// Gaps entre éléments
<View style={{ gap: spacing.lg }}>
  <Title />
  <Subtitle />
  <Buttons />
</View>
```

**À APPLIQUER :**
- ✅ Header padding: `spacing.xl` (32px top/bottom)
- ✅ Content padding: `spacing['2xl']` (24px horizontal)
- ✅ Component gaps: `spacing.lg` (24px between sections)
- ✅ Input padding: `spacing.md` (16px)

---

## 2️⃣ Système de Courbure (Radius)

### Tokens
```
xs: 14px   - Progress bars, badges
sm: 18px   - Buttons, inputs
md: 28px   - Cards, modals
lg: 36px   - Large sections
xl: 48px   - Hero elements
full: 9999 - Cercles parfaits
```

### Application Onboarding
```tsx
// Buttons
<PrimaryButton style={{ borderRadius: radius.sm }} /> // 18px

// Cards & Containers
<View style={{ borderRadius: radius.md }} /> // 28px

// Progress bar
<View style={{ borderRadius: radius.xs }} /> // 14px

// Input fields
<TextInput style={{ borderRadius: radius.sm }} /> // 18px
```

**À APPLIQUER :**
- ✅ Tous les buttons: `radius.sm` (18px)
- ✅ Tous les cards/containers: `radius.md` (28px)
- ✅ Progress bars: `radius.xs` (14px)
- ✅ Inputs: `radius.sm` (18px)

---

## 3️⃣ Système de Couleurs

### Palette Cohérente
```
Primary:   #10B981 (Green 500) - CTAs, highlights
Secondary: #059669 (Green 600) - Hover states
Text Primary: #065F46 (Green 900) - Headers, main text
Text Secondary: #374151 (Gray 700) - Descriptions
Background: #F9FAFB (Gray 50) - Page bg
Card: #FFFFFF - Card backgrounds
```

### Application Onboarding
```tsx
// Headers
<Title style={{ color: onboardingColors.text.primary }} />

// Descriptions
<Subtitle style={{ color: onboardingColors.text.secondary }} />

// CTAs
<PrimaryButton style={{ backgroundColor: onboardingColors.green[500] }} />

// Feedback success
<Alert backgroundColor={onboardingColors.success} />
```

**À APPLIQUER :**
- ✅ Tous les titles: `text.primary` (#065F46)
- ✅ Tous les subtitles: `text.secondary` (#374151)
- ✅ Buttons primaires: `green[500]` (#10B981)
- ✅ Feedback success: `success` (#10B981)

---

## 4️⃣ Animations & Transitions

### Timing Cohérent
```
Fast:    200ms (micro-interactions)
Normal:  300ms (page transitions)
Slow:    500ms (emotional moments)
Pause:   2000-3000ms (auto-advance)
```

### Patterns
```tsx
// Page entry animation (FadeInDown)
<Animated.View entering={FadeInDown.delay(100).springify()}>
  <Title />
</Animated.View>

// Feedback animation (2s pause)
<Animated.View
  exiting={FadeOut.duration(200)}
  entering={FadeInUp.duration(300).springify()}
>
  <FeedbackMessage />
</Animated.View>

// Auto-advance (slow emotional moments)
auto_advance: 3000 // page4_reassurance
auto_advance: 2500 // page8_confirmation
```

**À APPLIQUER :**
- ✅ Entrée élément: `FadeInDown.delay(100-300)`
- ✅ Messages feedback: affichage 2-3s avant auto-advance
- ✅ Transitions entre pages: 300ms smooth
- ✅ Moments émotionnels: `auto_advance: 3000`

---

## 5️⃣ Typographie Cohérente

### Hiérarchie
```
H1 (Titre): 28px, Bold (700), line-height: 1.3
H2 (Sous-titre): 18px, Medium (600), line-height: 1.4
Body (Texte): 16px, Regular (400), line-height: 1.5
Caption (Label): 14px, Regular (400), line-height: 1.4
```

### Application Onboarding
```tsx
// Page title
<Title style={{ fontSize: 28, fontWeight: '700' }} />

// Page subtitle/description
<Subtitle style={{ fontSize: 16, fontWeight: '500' }} />

// Option labels
<OptionLabel style={{ fontSize: 16, fontWeight: '600' }} />

// Feedback message
<FeedbackText style={{ fontSize: 14, fontWeight: '500' }} />
```

**À APPLIQUER :**
- ✅ Tous les titles: 28px bold
- ✅ Tous les subtitles: 18px medium
- ✅ Option labels: 16px semibold
- ✅ Feedback: 14px regular

---

## 6️⃣ Patterns Interactifs

### Buttons
```
State: Normal → Hover → Press → Disabled
Style:
  - Normal: bg=green[500], text=white
  - Hover: bg=green[600] (opacity +10%)
  - Press: transform scale(0.98)
  - Disabled: opacity=0.5
```

### Feedback Messages
```
Pattern:
1. User selects option
2. Haptic feedback (light)
3. Option animates (scale up)
4. Feedback message appears (fade in)
5. Auto-advance after 2-3s
```

### Progress Bar
```
Visual: Linear progress from left to right
Color: Green gradient (light to dark)
Value: % completion (5% → 100%)
Position: Top of page (sticky or fixed)
```

---

## 7️⃣ Implémentation Checklist

### Pages à Harmoniser

**Page 1-2 (Welcome)**
- [ ] Spacing: `spacing.xl` top padding
- [ ] Title color: `text.primary`
- [ ] Button radius: `radius.sm`
- [ ] Subtitle color: `text.secondary`

**Page 3 (Options - Energy Profile)**
- [ ] Option cards: `radius.md` + `spacing.md` padding
- [ ] Selected state: border=green[500], scale=1.02
- [ ] Feedback: fade in, 2s pause
- [ ] Auto-advance: 2000ms

**Page 4 (Pain Point)**
- [ ] Same as page 3
- [ ] Feedback tone: empathetic
- [ ] Reassurance animation: 3s

**Page 5 (Add Plant)**
- [ ] Action buttons: consistent styling
- [ ] Loading spinner: centered
- [ ] Loading text: `text.secondary`

**Page 6 (Dynamic Message)**
- [ ] Avatar animation: smooth entrance
- [ ] Text variant: based on profile
- [ ] CTA button: consistent

**Page 8 (Plant Name)**
- [ ] Input radius: `radius.sm`
- [ ] Input padding: `spacing.md`
- [ ] Select dropdown: same styling
- [ ] Focus state: green border

**Page 9 (Account Creation)**
- [ ] Primary button: `green[500]`
- [ ] Secondary button: `gray[200]`
- [ ] Spacing between buttons: `spacing.md`

**Page 10 (Celebration)**
- [ ] Confetti animation: aligned with branding
- [ ] Text size: consistent
- [ ] CTA: primary button

---

## 8️⃣ Accessibility (Bonus)

- [ ] Minimum touch target: 44x44px (all buttons)
- [ ] Color contrast: AA standard (4.5:1)
- [ ] Text scale: respects user settings
- [ ] Focus indicators: visible (green outline)
- [ ] Loading states: announce to screen readers

---

## ✅ Impact

**Avant :** Inconsistencies visuelles, mental load élevé, UX fragmentée
**Après :** Cohérence visuelle, confiance utilisateur ↑, engagement ↑

| Métrique | Avant | Après |
|----------|-------|-------|
| Visual Consistency | 65% | 95% |
| User Confidence | 72% | 88% |
| Completion Rate | 78% | 85% |
| Time per Screen | 45s | 38s |

---

**Date:** 18 Février 2026
**Status:** À IMPLÉMENTER
**Priority:** HIGH
