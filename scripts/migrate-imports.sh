#!/bin/bash
# Script pour migrer les imports relatifs vers path aliases
# À exécuter depuis le répertoire greenbuddy-expo/

echo "🔄 Migration des imports relatifs vers path aliases..."

# Pattern 1: Imports de components
find app src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ['\''\"]\.\./src/features/plants/components|from "'"'"'@plants/components|g; \
  s|from ['\''\"]\.\./src/features/gamification/components|from "'"'"'@gamification/components|g; \
  s|from ['\''\"]\.\./src/features/auth/components|from "'"'"'@auth/components|g; \
  s|from ['\''\"]\.\./src/design-system/components|from "'"'"'@design-system/components|g; \
  s|from ['\''\"]\.\./src/design-system/animations|from "'"'"'@design-system/animations|g; \
  s|from ['\''\"]\.\./src/design-system/tokens|from "'"'"'@design-system/tokens|g' {} \;

# Pattern 2: Imports de services
find app src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ['\''\"]\.\./src/lib/services|from "'"'"'@lib/services|g; \
  s|from ['\''\"]\.\./src/features/plants/services|from "'"'"'@plants/services|g; \
  s|from ['\''\"]\.\./src/features/gamification/services|from "'"'"'@gamification/services|g' {} \;

# Pattern 3: Imports de hooks
find app src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ['\''\"]\.\./src/lib/hooks|from "'"'"'@lib/hooks|g; \
  s|from ['\''\"]\.\./src/features/plants/hooks|from "'"'"'@plants/hooks|g; \
  s|from ['\''\"]\.\./src/features/gamification/hooks|from "'"'"'@gamification/hooks|g' {} \;

# Pattern 4: Imports de types
find app src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ['\''\"]\.\./types|from "'"'"'@types|g; \
  s|from ['\''\"]\.\./\.\./types|from "'"'"'@types|g; \
  s|from ['\''\"]\.\./\.\./\.\./types|from "'"'"'@types|g' {} \;

# Pattern 5: Imports de context
find app src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ['\''\"]\.\./src/features/auth/context|from "'"'"'@auth/context|g' {} \;

# Pattern 6: Imports de constants
find app src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ['\''\"]\.\./src/lib/constants|from "'"'"'@lib/constants|g' {} \;

echo "✅ Migration complète!"
echo "Vérification des imports relatifs restants..."
grep -r "from ['\''\"]\.\." app src --include="*.ts" --include="*.tsx" | head -20 || echo "✅ Aucun import relatif détecté!"
