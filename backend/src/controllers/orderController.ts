import { Request, Response } from 'express';
import { adminDb } from '../config/firebase-admin';
import { Order, OrderItem, OrderStatus } from '../types';

const RESTAURANT_ID = 'default';
const ORDERS_COLLECTION = `restaurants/${RESTAURANT_ID}/orders`;

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { tableId, tableName, items } = req.body as {
      tableId: string;
      tableName: string;
      items: OrderItem[];
    };
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const orderData = {
      tableId,
      tableName,
      items,
      totalPrice,
      status: 'pending' as OrderStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await adminDb.collection(ORDERS_COLLECTION).add(orderData);
    res.status(201).json({ id: docRef.id, ...orderData });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la commande' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const coll = adminDb.collection(ORDERS_COLLECTION);
    const snapshot = status
      ? await coll.where('status', '==', status).orderBy('createdAt', 'desc').limit(50).get()
      : await coll.orderBy('createdAt', 'desc').limit(50).get();
    const orders = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const doc = await adminDb
      .collection(ORDERS_COLLECTION)
      .doc(req.params.id)
      .get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la commande' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };
    const updates: Partial<Order> = {
      status,
      updatedAt: new Date(),
    };
    if (status === 'delivered') {
      updates.deliveredAt = new Date();
    }
    await adminDb.collection(ORDERS_COLLECTION).doc(id).update(updates);
    res.json({ id, status });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};
