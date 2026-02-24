import { Request, Response } from 'express';
import { adminStorage } from '../config/firebase-admin';

const RESTAURANT_ID = 'default';
const BUCKET = adminStorage.bucket();

/**
 * Retourne l'URL publique Firebase Storage pour un fichier.
 * Les images sont bien stockées dans Firebase Storage (Blaze).
 */
function getFirebaseStoragePublicUrl(bucketName: string, objectPath: string): string {
  const encodedPath = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;
}

export const uploadMenuImage = async (req: Request, res: Response) => {
  try {
    const { base64, menuId, mimeType = 'image/jpeg' } = req.body as {
      base64: string;
      menuId: string;
      mimeType?: string;
    };

    if (!base64 || !menuId) {
      return res.status(400).json({ error: 'base64 et menuId requis' });
    }

    const rawBase64 = base64.replace(/^data:image\/\w+;base64,/, '').replace(/\s/g, '');
    const buffer = Buffer.from(rawBase64, 'base64');

    const objectPath = `restaurants/${RESTAURANT_ID}/menus/${menuId}/image.jpg`;
    const file = BUCKET.file(objectPath);

    await file.save(buffer, {
      metadata: { contentType: mimeType },
    });

    const bucketName = BUCKET.name;
    const url = getFirebaseStoragePublicUrl(bucketName, objectPath);

    res.json({ url });
  } catch (error) {
    console.error('uploadMenuImage error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
  }
};
