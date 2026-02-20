# Déploiement des index Firestore

## Méthode 1 : Via le lien direct (recommandé)

Quand tu vois l'erreur dans la console, clique sur le lien fourni. Il créera automatiquement l'index nécessaire.

## Méthode 2 : Via Firebase Console

1. Va sur https://console.firebase.google.com
2. Sélectionne le projet `click-and-eat-66c8f`
3. Va dans **Firestore Database** → **Indexes**
4. Clique sur **Créer un index**
5. Configure :
   - Collection ID: `orders`
   - Champs à indexer:
     - `tableId` (Ascendant)
     - `createdAt` (Descendant)
   - Collection group: `orders`
6. Clique sur **Créer**

## Méthode 3 : Via Firebase CLI

```bash
cd firebase
firebase deploy --only firestore:indexes
```

**Note:** Les index peuvent prendre quelques minutes à être créés. Une fois créés, l'erreur disparaîtra automatiquement.
