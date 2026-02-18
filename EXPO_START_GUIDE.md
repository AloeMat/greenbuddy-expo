# 📱 Guide de Démarrage Expo Go

## Étape 1 : Ouvrir PowerShell

Ouvre une **nouvelle fenêtre PowerShell** et exécute les commandes suivantes.

## Étape 2 : Naviguer vers le projet

```powershell
cd C:\Users\matth\GreenBuddy_aistudiomvp\greenbuddy-expo
```

## Étape 3 : Démarrer le serveur Expo

```powershell
npx expo start --clear
```

**Attends que le serveur démarre (30-45 secondes)**

Tu devrais voir :
```
✅ Metro bundler ready
📱 Scan this QR code with your phone to open the app:
[QR CODE]
```

## Étape 4 : Charger l'app

### Option A : Sur Android/iPhone
1. Ouvre l'app **Expo Go**
2. Clique sur **"Scan QR"**
3. Scanne le QR code affiché dans PowerShell
4. L'app devrait charger en 15-30 secondes

### Option B : Sur Simulateur iOS (Mac uniquement)
1. Appuie sur **`i`** dans PowerShell
2. Le simulateur iOS devrait se lancer automatiquement

### Option C : Sur Émulateur Android
1. Appuie sur **`a`** dans PowerShell
2. L'émulateur Android devrait se lancer automatiquement

## ✅ Test Checklist

Quand l'app charge, teste les pages dans cet ordre :

- [ ] **Page 1-2**: Welcome screens + animations
- [ ] **Page 3**: Profil energetique (4 options) - Clique sur une option
- [ ] **Page 3_feedback**: Auto-advance apres 2 sec
- [ ] **Page 4**: Douleur personnelle (3 options) - Clique sur une option
- [ ] **Page 4_reassurance**: Auto-advance apres 3 sec
- [ ] **Page 5**: Actions (Camera/Gallery/Manual) - Clique sur "Manual"
- [ ] **Page 5_identification**: Loading + Auto-advance
- [ ] **Page 6**: Variant (affiche texte selon profil choisi)
- [ ] **Page 8**: Inputs (Nom plante + Personalite select) - Remplis et valide
- [ ] **Page 8_confirmation**: Auto-advance apres 2.5 sec
- [ ] **Page 7**: Care plan preview
- [ ] **Page 9**: Create account CTA
- [ ] **Page 10**: Final celebration screen

## Troubleshooting

### Port 8081 deja utilise ?
```powershell
# Essaie un port different
npx expo start --port 8082
```

### App refuse de charger ?
1. Ferme le serveur (Ctrl+C)
2. Vide le cache et redémarre:
```powershell
npx expo start --clear
```

### Erreur "Module not found" ?
```powershell
# Reinstalle les dependances
npm install
npx expo start --clear
```

## Notes

- La premiere compilation peut prendre 1-2 minutes
- Keep PowerShell window open while testing
- Si tu quittes le serveur (Ctrl+C), l'app affichera une erreur - redémarre simplement

## Success !

Quand tous les tests passent, l'onboarding est pret pour production !
