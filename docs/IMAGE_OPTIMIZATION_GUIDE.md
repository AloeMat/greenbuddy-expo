# Image Optimization Guide - Phase 5.1b Quick Win #3

## 📊 Current Image Assets Analysis

### Assets by Size (Total: ~550KB)

| Image | Size | Type | Priority |
|-------|------|------|----------|
| icon.png | **385KB** | PNG | 🔴 HIGH |
| android-icon-foreground.png | 77KB | PNG | 🟡 MEDIUM |
| react-logo@3x.png | 21KB | PNG | 🟢 LOW |
| splash-icon.png | 18KB | PNG | 🟢 LOW |
| android-icon-background.png | 18KB | PNG | 🟢 LOW |
| react-logo@2x.png | 14KB | PNG | 🟢 LOW |
| react-logo.png | 6.2KB | PNG | 🟢 LOW |
| partial-react-logo.png | 5.0KB | PNG | 🟢 LOW |
| android-icon-monochrome.png | 4.1KB | PNG | 🟢 LOW |
| favicon.png | 1.2KB | PNG | 🟢 LOW |

**Total**: ~550KB

## 🎯 Optimization Targets

### Target Compression Ratios
```
PNG 32-bit → WebP: -30% to -50%
PNG 8-bit → WebP: -40% to -60%
PNG → Compressed PNG: -10% to -30%
```

### Expected Savings
```
High Compression (recommended):
- icon.png: 385KB → 192KB (50% reduction)
- android-icon-foreground.png: 77KB → 38KB (50% reduction)
- Others: ~70KB → 40KB (43% reduction)

Total Savings: ~550KB → ~270KB = -260KB (47% reduction)
```

## 🔧 Optimization Tools

### Option 1: Online Tools (No Installation)
**Best for quick optimization:**
- TinyPNG.com - Compress PNG/WebP
- Squoosh.app - Google's browser-based optimizer
- ImageOptim.com - Free online compression

**Steps:**
1. Visit TinyPNG.com
2. Drag & drop images
3. Download compressed versions
4. Replace originals

### Option 2: ImageMagick (CLI)
**Installation:**
```bash
# Windows (via Chocolatey)
choco install imagemagick

# macOS (via Homebrew)
brew install imagemagick

# Linux (Ubuntu)
sudo apt-get install imagemagick
```

**Commands:**
```bash
# Compress PNG (reduce colors)
convert input.png -colors 256 output.png

# Resize (if too large)
convert input.png -resize 50% output.png

# Combine compression
convert input.png -colors 256 -quality 85 output.png
```

### Option 3: cwebp (Recommended for WebP conversion)
**Installation:**
```bash
# Windows (via Chocolatey)
choco install libwebp

# macOS (via Homebrew)
brew install webp

# Linux (Ubuntu)
sudo apt-get install webp
```

**Commands:**
```bash
# Convert PNG to WebP (best compression)
cwebp -q 80 input.png -o output.webp

# Aggressive compression for app icons
cwebp -q 75 input.png -o output.webp

# Lossless conversion
cwebp -lossless input.png -o output.webp
```

### Option 4: Batch Optimization Script
**Create `scripts/optimize-images.sh`:**
```bash
#!/bin/bash

# Compress all PNGs in assets/images/
cd assets/images/

echo "Optimizing images with ImageMagick..."
for file in *.png; do
  if [ -f "$file" ]; then
    echo "Compressing $file..."
    # Backup original
    cp "$file" "${file%.png}.png.bak"
    # Compress
    convert "$file" -colors 256 -quality 85 "$file"
    echo "✓ Compressed $file"
  fi
done

echo "✓ All images optimized!"
```

**Run:**
```bash
chmod +x scripts/optimize-images.sh
./scripts/optimize-images.sh
```

## 📋 Step-by-Step Optimization Plan

### Phase 1: High Priority (icon.png)
**Target**: Reduce from 385KB to ~190KB

**Method 1 (Easiest - Online):**
1. Go to TinyPNG.com
2. Upload `greenbuddy-expo/assets/images/icon.png`
3. Download compressed version
4. Replace original
5. **Save**: 385KB → ~190KB (-195KB)

**Method 2 (CLI - cwebp):**
```bash
cd greenbuddy-expo/assets/images/
cwebp -q 80 icon.png -o icon.webp
# Result: 385KB → ~190KB (-195KB)
```

### Phase 2: Medium Priority (android-icon-foreground.png)
**Target**: Reduce from 77KB to ~38KB

**Online:**
1. Upload to TinyPNG.com
2. Download
3. Replace
4. **Save**: 77KB → ~38KB (-39KB)

**CLI:**
```bash
cwebp -q 80 android-icon-foreground.png -o android-icon-foreground.webp
# Result: 77KB → ~38KB
```

### Phase 3: Lower Priority (react logos)
**Target**: ~70KB → ~40KB

**Batch Compress:**
```bash
# Compress all remaining PNGs
for file in react-logo*.png splash-icon.png android-icon-*.png favicon.png; do
  cwebp -q 75 "$file" -o "${file%.png}.webp"
done
```

## 🎨 Expo Image Configuration

**Update `app.json` for optimized image loading:**
```json
{
  "assetBundlePatterns": [
    "**/*"
  ],
  "plugins": [
    [
      "expo-image",
      {
        "optimize": true
      }
    ]
  ]
}
```

## ✅ Verification Checklist

After optimization:
- [ ] All images compressed
- [ ] Backup originals preserved (.bak files)
- [ ] Visual quality acceptable (no obvious degradation)
- [ ] Sizes verified with `ls -lh`
- [ ] App builds successfully
- [ ] Bundle size reduced

## 📊 Expected Bundle Impact

**Before Optimization:**
```
Total Assets: ~550KB
Main Bundle: 11.5MB (with assets)
```

**After Optimization:**
```
Total Assets: ~270KB (-280KB saved)
Main Bundle: 11.2MB (11.5MB - 0.3MB)
Overall Bundle: 12MB → 11.7MB (-2.5%)
```

## 🔄 Rollback Plan

If optimization degrades quality:
```bash
# Restore from backups
for file in *.png.bak; do
  cp "$file" "${file%.png.bak}"
done
```

## 📚 References

- TinyPNG API: https://tinypng.com/developers
- Squoosh: https://squoosh.app
- cwebp Guide: https://developers.google.com/speed/webp/docs/cwebp
- ImageMagick: https://imagemagick.org/

---

**Estimated Time**: 15-30 minutes (manual)

**Expected Savings**: -280KB to -350KB (50% image size reduction)

**Phase 5.1b Impact**: Bundle size reduction to ~11.7MB
