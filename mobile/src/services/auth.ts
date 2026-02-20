import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const login = (email: string, password: string) => {
  if (!auth) throw new Error('Firebase Auth non disponible');
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  if (!auth) return Promise.resolve();
  return signOut(auth);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  if (!auth) {
    // Si Auth n'est pas disponible, simuler un utilisateur null
    callback(null);
    return () => {}; // Retourner une fonction de nettoyage vide
  }
  return onAuthStateChanged(auth, callback);
};
