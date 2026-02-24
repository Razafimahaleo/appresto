import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useTable } from '../../contexts/TableContext';
import { subscribeToTableOrders } from '../../services/firestore';
import type { Order } from '../../types';

// Lecture en flux (downloadFirst: false) pour éviter l'erreur de téléchargement Expo.
const NOTIFICATION_SOUND_URL =
  'https://assets.mixkit.co/active_storage/sfx/2731-magical-chime.mp3';

/**
 * Écoute les commandes de la table du client. Dès qu'une commande passe en "ready",
 * affiche une alerte "Votre commande est prête" et joue un son.
 */
export default function OrderReadyNotifier() {
  const { tableId } = useTable();
  const previousStatuses = useRef<Record<string, Order['status']>>({});

  const player = useAudioPlayer(NOTIFICATION_SOUND_URL, { downloadFirst: false });

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!tableId) return;

    const unsub = subscribeToTableOrders(tableId, (orders) => {
      for (const order of orders) {
        const prev = previousStatuses.current[order.id];
        previousStatuses.current[order.id] = order.status;
        if (order.status === 'ready' && prev !== undefined && prev !== 'ready') {
          player.seekTo(0).then(() => player.play()).catch(() => {});
          Alert.alert('Votre commande est prête', 'Vous pouvez venir récupérer votre commande.');
        }
      }
    });

    return () => {
      previousStatuses.current = {};
      unsub();
    };
  }, [tableId, player]);

  return null;
}
