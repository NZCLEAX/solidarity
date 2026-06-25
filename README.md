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

## Déploiement sur Vercel

La plateforme est configurée pour un déploiement continu avec Vercel.

### 1. Connecter GitHub à Vercel

1.  Rendez-vous sur votre tableau de bord Vercel et cliquez sur **"Add New..." > "Project"**.
2.  Choisissez **"Import Git Repository"** et sélectionnez le dépôt GitHub de ce projet.
3.  Vercel détectera automatiquement la configuration (Vite) et proposera les bons réglages. Vous n'avez normalement rien à changer. Cliquez sur **"Deploy"**.

### 2. Previews Automatiques

Une fois le projet importé, Vercel automatise les déploiements :

-   **Déploiement de Production** : Chaque `push` ou `merge` sur la branche `main` déploie sur l'URL de production.
-   **Déploiement de Preview** : Chaque `push` sur une autre branche (ou chaque nouvelle Pull Request) crée un déploiement de prévisualisation avec une URL unique. C'est parfait pour tester et valider les changements en équipe avant de les fusionner.

### 3. Relier l'application à Supabase

### Comment déployer une nouvelle fonctionnalité en production ?

Le processus est conçu pour être sûr et collaboratif :

1.  **Poussez votre branche de fonctionnalité** : Poussez votre branche (par exemple, `feature/ma-nouvelle-fonction`) sur GitHub. Vercel créera automatiquement un déploiement de **Preview**.
2.  **Créez une Pull Request (PR)** : Sur GitHub, ouvrez une Pull Request de votre branche de fonctionnalité vers la branche `main`.
3.  **Validez la Preview** : Vercel ajoutera un commentaire dans votre PR avec un lien vers le déploiement de Preview. C'est l'occasion pour vous et votre équipe de tester les changements dans un environnement réel, mais isolé.
4.  **Fusionnez la PR** : Une fois que tout est validé, fusionnez la Pull Request dans la branche `main`.
5.  **Déploiement automatique en production** : Vercel détectera la fusion et lancera automatiquement un nouveau déploiement en utilisant le code de la branche `main`. Votre nouvelle fonctionnalité est maintenant en ligne !

#### Où trouver l'URL de Preview ?

Il y a deux endroits principaux pour trouver le lien vers votre déploiement de prévisualisation :

1.  **Dans la Pull Request sur GitHub** : C'est la méthode la plus simple. Une fois la PR créée, le bot Vercel poste automatiquement un commentaire avec un lien direct vers la preview. Vous verrez également le statut du déploiement dans les "checks" de la PR.

2.  **Sur le tableau de bord Vercel** : Connectez-vous à votre compte Vercel, ouvrez votre projet, et allez dans l'onglet **"Deployments"**. Vous y verrez la liste de tous les déploiements, y compris ceux de vos branches. Vous pouvez cliquer sur "Visit" pour ouvrir la preview correspondante.

### 4. Relier l'application à Supabase

Pour que l'application déployée puisse communiquer avec votre base de données, vous devez configurer les variables d'environnement sur Vercel.

1.  Dans les paramètres de votre projet Vercel, allez dans **`Settings` > `Environment Variables`**.
2.  Ajoutez les deux variables suivantes :
    -   `VITE_SUPABASE_URL` : L'URL de votre projet Supabase.
    -   `VITE_SUPABASE_ANON_KEY` : La clé publique (`anon key`) de votre projet Supabase.
3.  Pour chaque variable, assurez-vous de la rendre disponible pour tous les environnements en cochant **Production**, **Preview**, et **Development**.

### 5. Gérer les environnements (Bonnes pratiques)

Pour l'instant, vous utilisez un seul projet Supabase, ce qui est simple pour démarrer. Les mêmes clés Supabase sont donc utilisées pour la production, les previews et le développement local.

**Recommandation pour le futur :** Quand le projet grandira, il est fortement conseillé de créer **deux projets Supabase distincts** :
-   Un pour la **production** (avec les vraies données).
-   Un pour le **développement et les previews** (avec des données de test).

Cela permet d'isoler complètement vos environnements et d'éviter tout risque pour les données de production. À ce moment-là, vous pourrez configurer des variables d'environnement différentes pour l'environnement "Production" et les environnements "Preview" / "Development" dans Vercel.

### 6. Développement Local

Pour que votre environnement local utilise les mêmes variables que Vercel (et éviter de les stocker dans le `.env`), vous pouvez utiliser la CLI de Vercel :

```bash
# Installer la CLI Vercel
npm i -g vercel

# Lier votre projet local au projet Vercel
vercel link

# Télécharger les variables d'environnement (celles de "Development")
vercel env pull
```

Cette commande crée un fichier `.env.local` que Vite utilisera automatiquement.
