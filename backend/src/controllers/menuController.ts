import { Request, Response } from 'express';
import { adminDb } from '../config/firebase-admin';
import { MenuItem } from '../types';

const RESTAURANT_ID = 'default';
const COLLECTION = `restaurants/${RESTAURANT_ID}/menus`;

export const getAllMenus = async (_req: Request, res: Response) => {
  try {
    const snapshot = await adminDb.collection(COLLECTION).get();
    const menus = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des menus' });
  }
};

export const getMenuById = async (req: Request, res: Response) => {
  try {
    const doc = await adminDb.collection(COLLECTION).doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Menu introuvable' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du menu' });
  }
};

export const createMenu = async (req: Request, res: Response) => {
  try {
    const menu: Omit<MenuItem, 'id'> = req.body;
    const docRef = await adminDb.collection(COLLECTION).add({
      ...menu,
      isAvailable: menu.isAvailable ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.status(201).json({ id: docRef.id, ...menu });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du menu' });
  }
};

export const updateMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    await adminDb.collection(COLLECTION).doc(id).update(updates);
    res.json({ id, ...updates });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du menu' });
  }
};

export const deleteMenu = async (req: Request, res: Response) => {
  try {
    await adminDb.collection(COLLECTION).doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du menu' });
  }
};
