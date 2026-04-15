# Solidarity MVP

Plateforme de coordination solidaire — squelette MVP.

## Stack

- **Framework** : React 18 + Vite 5
- **Langage** : TypeScript (strict)
- **Style** : Tailwind CSS 3
- **Routing** : React Router 6
- **Data fetching** : TanStack Query 5
- **Formulaires** : React Hook Form + Zod
- **Carte** : React Leaflet + Leaflet
- **Backend** : Supabase (Auth + DB + Storage)

## Lancer le projet

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# 3. Démarrer le serveur de développement
npm run dev
```

## Structure

```
src/
├── app/              # Router, QueryClient, providers globaux
├── components/
│   └── ui/           # Composants réutilisables (Button, Input…)
├── features/
│   ├── auth/         # Connexion / déconnexion
│   ├── dashboard/    # Dashboard principal
│   ├── map/          # Carte des interventions
│   ├── points/       # Gestion des points de collecte
│   ├── interventions/# Interventions terrain
│   ├── moderation/   # Modération du contenu
│   └── admin/        # Administration
├── hooks/            # Hooks partagés
└── lib/              # Supabase client, utilitaires

supabase/
└── migrations/       # Migrations SQL
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé publique anon Supabase |

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |
| `npm run type-check` | Vérification TypeScript |
| `npm run lint` | Analyse ESLint |
