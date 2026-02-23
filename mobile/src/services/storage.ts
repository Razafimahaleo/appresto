import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload une image vers Firebase Storage à partir de sa base64 (data URL).
 * Cette méthode est la plus fiable sur Expo Go car elle ne dépend d'aucun
 * accès fichier natif — le SDK Firebase JS sait traiter les data URL directement.
 *
 * @param base64 - La base64 de l'image (sans le préfixe "data:image/...;base64,")
 * @param mimeType - Le type MIME de l'image (ex: "image/jpeg")
 */
export async function uploadMenuImage(params: {
  restaurantId: string;
  menuId: string;
  base64: string;
  mimeType?: string;
}): Promise<string> {
  const { restaurantId, menuId, base64, mimeType = 'image/jpeg' } = params;

  const dataUrl = `data:${mimeType};base64,${base64}`;
  const objectPath = `restaurants/${restaurantId}/menus/${menuId}/image.jpg`;
  const objectRef = ref(storage, objectPath);

  await uploadString(objectRef, dataUrl, 'data_url');

  return await getDownloadURL(objectRef);
}
