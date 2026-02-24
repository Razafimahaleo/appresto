// Expo charge .env automatiquement - pas besoin de dotenv
module.exports = {
  expo: {
    name: 'AppResto',
    slug: 'appresto',
    version: '1.0.0',
    orientation: 'landscape',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0d9488',
    },
    assetBundlePatterns: ['**/*'],
    extra: {
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.appresto.client',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0d9488',
      },
      package: 'com.appresto.client',
      usesCleartextTraffic: true,
    },
  },
};
