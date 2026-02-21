# Instructions pour Claude Code

## Projet actif
Ce dossier (`greenbuddy-expo/`) est le **seul projet actif**. Toujours travailler ici.

## Repos Git
- **Ce projet** → `greenbuddy-expo/` → branches : `dev` (développement), `main` (production)
- **Ne JAMAIS toucher** au repo racine `GreenBuddy_aistudiomvp/` (repo parent, legacy)

## Workflow Git
- Toujours travailler sur la branche `dev`
- Merger `dev` → `main` uniquement pour les releases
- Ne jamais committer dans le repo racine

## Stack
- Framework : Expo + React Native + TypeScript
- Routing : Expo Router (file-system)
- Backend : Supabase (Edge Functions dans `supabase/functions/`)
- State : Zustand
- Architecture : Feature-Sliced Design (FSD)

## Langue
Répondre toujours en **français**.
