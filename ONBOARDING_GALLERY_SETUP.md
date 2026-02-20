# Gallery & Manual Plant Selection - Installation Guide

## 📋 Overview

Complete implementation of Gallery and Manual Plant Selection for the onboarding flow (page5).

**Status**: Ready to implement after `expo-image-picker` installation

---

## 🔧 Installation Steps

### Step 1: Install expo-image-picker

```bash
cd greenbuddy-expo
npm install expo-image-picker
```

Or with yarn:
```bash
yarn add expo-image-picker
```

### Step 2: Update ActionsRenderer.tsx

The code is already prepared. Just uncomment this import after installation:

```typescript
import * as ImagePicker from 'expo-image-picker';
```

Currently at: `src/features/onboarding/components/renderers/ActionsRenderer.tsx:16`

### Step 3: Replace placeholder implementations

Current placeholders (lines 70-84):
```typescript
const handleImportGallery = () => {
  Alert.alert('Galerie', 'Cette fonctionnalité sera disponible après installation d\'expo-image-picker.');
};

const handleManualSelect = () => {
  Alert.alert('Sélection manuelle', 'Cette fonctionnalité sera implémentée prochainement.');
};
```

Will be replaced with full implementations.

---

## 📱 Implementation Details

### Gallery Flow (handleImportGallery)

**Sequence:**
1. Request media library permissions
2. Launch image picker
3. User selects and crops image (1:1 aspect ratio)
4. Compress image to 2048x2048
5. Convert to base64
6. Send to PlantNet for identification
7. Store plant data
8. Navigate to next page

**Code:**
```typescript
const handleImportGallery = async () => {
  try {
    setIsLoading(true);
    setLoadingMessage('📖 Accès à la galerie...');

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'L\'accès à la galerie est nécessaire.');
      setIsLoading(false);
      return;
    }

    setLoadingMessage('📷 Sélection en cours...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      setIsLoading(false);
      return;
    }

    const imageUri = result.assets[0].uri;
    setLoadingMessage('🔄 Compression...');
    const compressed = await cameraService.compressImage(imageUri, 2048);
    setLoadingMessage('🔄 Préparation...');
    const base64 = await cameraService.getBase64(compressed);
    setLoadingMessage('🔍 Identification en cours...');
    const identified = await plantNetService.identifyPlant(base64);

    if (!identified) {
      Alert.alert('Identification échouée', 'Veuillez réessayer avec une autre image.');
      setIsLoading(false);
      return;
    }

    store.setPlantData(base64, identified);
    setIsLoading(false);
    onNavigate(page.next);
  } catch (error) {
    logger.error('[ActionsRenderer] Gallery error:', error);
    Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection de l\'image.');
    setIsLoading(false);
  }
};
```

### Manual Selection Flow (handleManualSelect)

**Sequence:**
1. Show alert prompt for plant name
2. Validate name input
3. Create manual plant entry
4. Store with empty base64 (no image)
5. Navigate to next page

**Code:**
```typescript
const handleManualSelect = () => {
  Alert.prompt(
    'Sélection manuelle',
    'Entrez le nom de votre plante',
    [
      { text: 'Annuler', onPress: () => {}, style: 'cancel' },
      {
        text: 'Continuer',
        onPress: (plantName) => {
          if (!plantName?.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer un nom de plante.');
            return;
          }

          // Create a manual plant entry
          const manualPlant = {
            commonName: plantName.trim(),
            scientificName: 'Inconnue',
            family: 'Inconnue',
            confidence: 0, // Manual entry, no confidence score
          };

          // Store with a placeholder base64 (empty image)
          store.setPlantData('', manualPlant);
          onNavigate(page.next);
        },
      },
    ],
    'plain-text'
  );
};
```

---

## ✅ Features Implemented

### Gallery Action
- ✅ Media library permission request
- ✅ Image picker with 1:1 cropping
- ✅ Progressive loading messages
- ✅ Image compression (2048x2048)
- ✅ PlantNet identification
- ✅ Error handling with fallback
- ✅ Cancel support

### Manual Selection
- ✅ Alert prompt for plant name
- ✅ Input validation
- ✅ Manual plant creation
- ✅ Support for unknown plants
- ✅ Graceful navigation

### Both Actions
- ✅ Haptic feedback (via parent ActionsRenderer)
- ✅ Loading state management
- ✅ Button disable during processing
- ✅ Error alerts to user
- ✅ Try-catch error handling
- ✅ Proper state cleanup

---

## 🔄 Page Flow (page5)

```
Page 5: "Ajoutons votre première plante"
└── 3 Actions:
    ├── 📸 Camera (Prendre une photo) ✅ WORKING
    ├── 📖 Gallery (Choisir dans galerie) ⏳ AFTER INSTALL
    └── 🔍 Manual (Je connais le nom) ⏳ AFTER INSTALL
└── On Complete:
    ├── Store plant data
    └── Navigate to page5_identification
```

---

## 📊 Integration Points

### Dependencies
- `expo-image-picker`: Image selection from device gallery
- `cameraService`: Image compression & base64 conversion
- `plantNetService`: Plant identification API
- `useOnboardingStore`: Store plant data

### Stores
- `onboardingStore.setPlantData(base64, identifiedPlant)`

### Services
- `cameraService.compressImage(uri, maxSize)`
- `cameraService.getBase64(uri)`
- `plantNetService.identifyPlant(base64)`

---

## 🧪 Testing Checklist

After installation:

- [ ] Gallery: Select image from device
- [ ] Gallery: Crop image to 1:1 aspect ratio
- [ ] Gallery: Image compresses without error
- [ ] Gallery: PlantNet identifies plant
- [ ] Gallery: Loading messages update progressively
- [ ] Gallery: Navigate to page5_identification on success
- [ ] Manual: Enter plant name
- [ ] Manual: Validate non-empty input
- [ ] Manual: Create manual plant entry
- [ ] Manual: Navigate to page5_identification
- [ ] Manual: Back button cancels without action

---

## 📝 Next Steps

1. **Install expo-image-picker**
   ```bash
   npm install expo-image-picker
   ```

2. **Uncomment import in ActionsRenderer.tsx**
   ```typescript
   import * as ImagePicker from 'expo-image-picker';
   ```

3. **Replace placeholder implementations** with full code above

4. **Run tests on device** to ensure:
   - Permissions are requested correctly
   - Images are selected and processed
   - Plant identification works
   - Navigation flows correctly

5. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: Implement gallery and manual plant selection"
   ```

---

## ⚠️ Known Limitations

- **Gallery crops to 1:1**: Some plants may lose detail
- **Manual plants**: No image, no confidence score
- **Permissions**: Must be granted before action
- **Offline**: Gallery requires device storage

---

## 🔗 Related Files

- `src/features/onboarding/components/renderers/ActionsRenderer.tsx` - Main renderer
- `src/features/plants/services/camera.ts` - Image compression
- `src/features/plants/services/plantnet.ts` - Plant identification
- `src/features/onboarding/store/onboardingStore.ts` - State management

