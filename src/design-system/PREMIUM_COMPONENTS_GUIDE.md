# 🎨 Premium Design System v2.0

Complete component library for GreenBuddy with elevation shadows, animations, and haptic feedback.

## Components Overview

### 1. **PremiumButton**
Multi-variant button with haptic feedback, elevation states, and accessibility support.

```tsx
import { PremiumButton } from '@/src/design-system/components';

<PremiumButton
  variant="primary"      // 'primary' | 'secondary' | 'outline' | 'ghost'
  size="md"              // 'sm' | 'md' | 'lg'
  onPress={() => {}}
  disabled={false}
>
  Click me
</PremiumButton>
```

**Variants:**
- `primary` - Filled green button (default)
- `secondary` - Green bordered button
- `outline` - Border-only button
- `ghost` - Text-only button

**Features:**
- Haptic feedback on press (light/medium/strong)
- Scale animation (1 → 0.98) with shadow reduction
- Accessibility props (role="button", disabled state)
- Optional left icon support

---

### 2. **PremiumCard**
Container with elevation system for visual hierarchy.

```tsx
<PremiumCard
  elevation="md"        // 'sm' | 'md' | 'lg'
  padding="lg"          // 'sm' | 'md' | 'lg'
  borderColor="#E5E7EB"
  backgroundColor="white"
>
  {/* Content */}
</PremiumCard>
```

**Elevations:**
- `sm` - Subtle shadow (1dp equivalent)
- `md` - Medium shadow (8dp equivalent)
- `lg` - Strong shadow (16dp equivalent)

---

### 3. **PremiumInput**
Form input with focus states, error handling, and haptic feedback.

```tsx
<PremiumInput
  label="Email"
  placeholder="user@example.com"
  error="Invalid email"
  icon={<Feather name="mail" />}
  enterDelay={100}
/>
```

**Features:**
- Focus state styling (color change + elevation)
- Error message display
- Optional icon support
- Haptic feedback on focus/blur
- FadeInDown animation

---

### 4. **PremiumBadge**
Status indicators with 4 variants and 3 size options.

```tsx
<PremiumBadge
  label="Active"
  variant="success"      // 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size="md"              // 'sm' | 'md' | 'lg'
  icon={<CheckIcon />}
  loading={false}
/>
```

**Variants:**
- `success` (green) - Positive state
- `error` (red) - Error/attention
- `warning` (amber) - Warning state
- `info` (blue) - Information
- `neutral` (gray) - Default state

---

### 5. **ProgressBar**
Animated progress indicator with optional label.

```tsx
<ProgressBar
  progress={65}          // 0-100
  height={8}
  color={onboardingColors.green[500]}
  showLabel={true}
  animated={true}
/>
```

**Features:**
- Smooth animation to target progress
- Optional percentage label
- Customizable color and height
- Shadow elevation on label

---

### 6. **AlertBox**
Alert/notification component with action support.

```tsx
<AlertBox
  type="success"         // 'success' | 'error' | 'warning' | 'info'
  title="Success"
  message="Plant added successfully"
  dismissible={true}
  onDismiss={() => {}}
  actionLabel="Undo"
  onAction={() => {}}
/>
```

**Features:**
- 4 alert types with auto icons
- Dismissible with X button
- Optional action button
- SlideInRight animation
- Left colored border

---

### 7. **PremiumDialog**
Modal dialog with confirm/cancel actions.

```tsx
<PremiumDialog
  visible={isOpen}
  onDismiss={() => setIsOpen(false)}
  title="Confirm Action"
  description="Are you sure?"
  isDangerous={false}     // Danger mode (red confirm button)
  confirmLabel="Delete"
  cancelLabel="Cancel"
  onConfirm={() => {}}
  onCancel={() => {}}
/>
```

**Features:**
- Transparent backdrop
- 2-button action layout
- Danger mode (red confirm button)
- SlideInUp animation for content
- Full width with max-width constraint

---

### 8. **PremiumChipGroup**
Selectable chip/tag group with multi-select support.

```tsx
<PremiumChipGroup
  items={[
    { id: '1', label: 'Water', icon: <WaterIcon /> },
    { id: '2', label: 'Sunlight' },
  ]}
  selected={['1']}
  onSelect={(id) => {}}
  onRemove={(id) => {}}
  multiSelect={false}
/>
```

**Features:**
- Single or multi-select mode
- Optional icons per item
- Check icon appears on selection
- Disabled state support
- FadeInDown animation

---

### 9. **PremiumStats**
Display stats/metrics with trend indicators.

```tsx
<PremiumStats
  items={[
    {
      icon: <HeartIcon />,
      label: 'Health',
      value: '85%',
      color: onboardingColors.green[600],
      trend: 'up',
    },
  ]}
  layout="row"           // 'row' | 'column'
/>
```

**Features:**
- Row or column layout
- Optional trend indicator (↑ ↓ −)
- Trend colors (green up, red down, gray neutral)
- Icon support
- Shadow elevation

---

### 10. **PremiumAccordion**
Expandable accordion with single/multi-expand modes.

```tsx
<PremiumAccordion
  items={[
    {
      id: '1',
      title: 'Care Tips',
      description: 'How to care for this plant',
      content: <CareContent />,
      icon: <InfoIcon />,
    },
  ]}
  allowMultiple={false}
/>
```

**Features:**
- Smooth expand/collapse animation
- Icon rotation on expand
- Single or multiple open items
- Optional description text
- Border color change on expand

---

### 11. **Divider**
Horizontal/vertical separator with variants.

```tsx
<Divider
  variant="solid"        // 'solid' | 'dashed' | 'dotted'
  orientation="horizontal"
  color={onboardingColors.gray[200]}
  label="Or continue with"
/>
```

**Features:**
- Solid, dashed, dotted variants
- Horizontal or vertical
- Optional centered label
- Customizable color and thickness

---

## Design Tokens

### Spacing
```typescript
spacing: {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, ...
}
```

### Radius
```typescript
radius: {
  xs: 14, sm: 18, md: 28, lg: 36, xl: 48, full: 9999
}
```

### Shadows (Elevation-based)
```typescript
shadows: {
  xs: { shadowColor: '#10B981', elevation: 1 },
  sm: { shadowColor: '#10B981', elevation: 4 },
  md: { shadowColor: '#10B981', elevation: 8 },
  lg: { shadowColor: '#10B981', elevation: 16 },
  xl: { shadowColor: '#10B981', elevation: 24 },
}
```

### Colors (Onboarding)
```typescript
colors: {
  green: { 50, 100, 200, ..., 700 },
  gray: { 50, 100, 200, ..., 700 },
  error: '#DC2626',
}
```

---

## Common Patterns

### Form with validation
```tsx
<PremiumCard padding="lg">
  <PremiumInput
    label="Plant Name"
    value={plantName}
    onChangeText={setPlantName}
    error={errors.plantName}
  />
  <Divider spacing={12} />
  <PremiumInput
    label="Location"
    value={location}
    onChangeText={setLocation}
  />
  <PremiumButton
    onPress={handleSubmit}
  >
    Add Plant
  </PremiumButton>
</PremiumCard>
```

### Status display
```tsx
<PremiumStats
  items={[
    {
      icon: <HeartIcon />,
      label: 'Health',
      value: plantHealth,
      trend: plantHealth > prevHealth ? 'up' : 'down',
    },
  ]}
/>
```

### Confirmation flow
```tsx
<PremiumDialog
  visible={showConfirm}
  title="Delete Plant?"
  isDangerous={true}
  onConfirm={() => deletePlant()}
  onDismiss={() => setShowConfirm(false)}
/>
```

---

## Animation Defaults

All components include FadeInDown entrance animation with configurable delay:

```tsx
<PremiumButton enterDelay={0} />     // No delay
<PremiumButton enterDelay={100} />   // 100ms delay
<PremiumButton enterDelay={200} />   // 200ms delay (for cascades)
```

Use `enterDelay` for staggered animations in lists.

---

## Accessibility

All components include:
- ✅ ARIA labels and roles
- ✅ Disabled state support
- ✅ Touch target sizing (min 44x44dp)
- ✅ Color contrast (WCAG AA)
- ✅ Screen reader compatibility

---

## Best Practices

1. **Use PremiumCard** as main layout container
2. **Use PremiumButton** for all interactive actions
3. **Use PremiumInput** for form fields
4. **Stack components** with spacing tokens, not hardcoded values
5. **Enable haptic feedback** for key interactions
6. **Use elevation** to create visual hierarchy
7. **Test on real devices** (shadows render differently than web)

---

## Icons

Components support icons from `@expo/vector-icons`:

```tsx
import { Feather } from '@expo/vector-icons';

<PremiumInput icon={<Feather name="mail" size={18} />} />
<PremiumChipGroup
  items={[
    { id: '1', label: 'Water', icon: <Feather name="droplets" /> }
  ]}
/>
```

---

## Version History

- **v2.0** - Launch: 11 components, shadow system, haptics, animations
- **v1.0** - Initial: Basic components (legacy)

---

## Next Steps

- [ ] Implement components in onboarding pages
- [ ] Add loading states to buttons
- [ ] Create form builder utility
- [ ] Add theme customization
- [ ] Implement dark mode support
