# Configuration AppResto

## 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Créez un projet (ou utilisez un existant)
3. Activez **Firestore Database** (mode test pour démarrer)
4. Activez **Authentication** (optionnel pour Chef/Caissière)

---

## 2. Backend - Récupérer les identifiants Admin

1. Firebase Console → **Paramètres du projet** (icône engrenage)
2. **Comptes de service** → **Générer une nouvelle clé privée**
3. Un fichier JSON est téléchargé – gardez-le en sécurité

Ouvrez `backend/.env` et remplissez :

```
PORT=3000

FIREBASE_PROJECT_ID=le-id-de-votre-projet
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...contenu...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@votre-projet.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
```

> **Important** : Pour `FIREBASE_PRIVATE_KEY`, copiez la valeur `private_key` du JSON. Les retours à la ligne doivent rester `\n` (ne pas les remplacer par de vrais sauts de ligne).

---

## 3. Mobile - Récupérer la config Web

1. Firebase Console → **Paramètres du projet**
2. **Vos applications** → **</>** (icône Web) pour ajouter une app
3. Donnez un surnom (ex. "AppResto") → Enregistrer
4. Copiez l'objet `firebaseConfig` affiché

Ouvrez `mobile/.env` et remplissez :

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre-projet
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## 4. Lancer l'application

### Backend
```powershell
cd backend
npm install
npm run dev
```

### Mobile
```powershell
cd mobile
npm install
npx expo start
```
Puis appuyez sur `a` pour Android.

---

## 5. Données de test (Firestore)

Pour afficher des menus, créez des documents dans :

**Collection** : `restaurants/default/menus`

**Exemple de document** :
- Champ `name` (string) : "Pizza Margherita"
- Champ `description` (string) : "Tomate, mozzarella, basilic"
- Champ `price` (number) : 12.5
- Champ `category` (string) : "Plats"
- Champ `isAvailable` (boolean) : true

emplacement:nam5(United states)