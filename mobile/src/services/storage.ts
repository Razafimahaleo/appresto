import { readAsStringAsync } from 'expo-file-system/legacy';
import { EncodingType } from 'expo-file-system/legacy';
import Constants from 'expo-constants';

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:3000';

/**
 * Upload une image via le backend (évite Blob / ArrayBuffer non supportés en React Native).
 * Lit l'image en base64 puis envoie au backend qui upload vers Firebase Storage.
 */
export async function uploadMenuImage(params: {
  restaurantId: string;
  menuId: string;
  base64?: string;
  imageUri?: string;
  mimeType?: string;
}): Promise<string> {
  const { menuId, mimeType = 'image/jpeg' } = params;

  let rawBase64: string;

  if (params.imageUri) {
    rawBase64 = await readAsStringAsync(params.imageUri, {
      encoding: EncodingType.Base64,
    });
  } else if (params.base64) {
    rawBase64 = params.base64
      .replace(/^data:image\/\w+;base64,/, '')
      .replace(/\s/g, '');
  } else {
    throw new Error('Fournir base64 ou imageUri');
  }

  const res = await fetch(`${API_URL}/api/upload/menu-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64: rawBase64, menuId, mimeType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload échoué (${res.status})`);
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}

export function getApiUrl(): string {
  return API_URL;
}
