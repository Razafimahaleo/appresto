import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload une image locale (uri) vers Firebase Storage et retourne l'URL publique.
 * Compatible Expo (uri du type file://...).
 */
export async function uploadMenuImage(params: {
  restaurantId: string;
  menuId: string;
  imageUri: string;
}): Promise<string> {
  const { restaurantId, menuId, imageUri } = params;

  // Expo: convertir file:// en Blob
  const response = await fetch(imageUri);
  const blob = await response.blob();

  const objectPath = `restaurants/${restaurantId}/menus/${menuId}/image.jpg`;
  const objectRef = ref(storage, objectPath);

  await uploadBytes(objectRef, blob, {
    contentType: blob.type || 'image/jpeg',
  });

  return await getDownloadURL(objectRef);
}

