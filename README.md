# AppResto - Application de commande restaurant

Application mobile pour restaurant avec trois interfaces tablette :
- **Client** : consulter le menu, commander, suivre le statut en temps réel
- **Chef** : recevoir et traiter les commandes
- **Caissière** : gérer les menus (CRUD), promotions, plats prêts à servir

## Stack technique
- **Frontend** : React Native (Expo)
- **Backend** : Node.js + Express
- **Base de données** : Firebase (Firestore, Auth)

## Structure du projet
```
appresto/
├── mobile/       # Application React Native
├── backend/      # API Node.js
└── firebase/     # Règles Firestore
```

## Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Firebase
- Expo CLI

### Backend
```powershell
cd backend
npm install
# Modifier .env avec vos identifiants Firebase (voir CONFIGURATION.md)
npm run dev
```

### Mobile
```powershell
cd mobile
npm install
# Modifier .env avec votre config Firebase Web (voir CONFIGURATION.md)
npx expo start
```
Puis appuyez sur `a` pour lancer sur l'émulateur Android.

### Firebase
1. Créer un projet sur [Firebase Console](https://console.firebase.google.com)
2. Activer Firestore et Authentication
3. Copier les credentials dans .env (backend) et firebase.ts (mobile)
4. Déployer les règles : `firebase deploy --only firestore:rules`

## Licence
MIT
