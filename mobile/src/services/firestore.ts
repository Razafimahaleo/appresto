import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Order, OrderItem, MenuItem } from '../types';

const RESTAURANT_ID = 'default';
const ORDERS_PATH = `restaurants/${RESTAURANT_ID}/orders`;
const MENUS_PATH = `restaurants/${RESTAURANT_ID}/menus`;

export const createOrder = async (
  tableId: string,
  tableName: string,
  items: OrderItem[]
) => {
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const docRef = await addDoc(collection(db, ORDERS_PATH), {
    tableId,
    tableName,
    items,
    totalPrice,
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const q = query(
    collection(db, ORDERS_PATH),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() ?? doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() ?? doc.data().updatedAt,
    })) as Order[];
    callback(orders);
  });
};

export const subscribeToTableOrders = (
  tableId: string,
  callback: (orders: Order[]) => void
) => {
  const q = query(
    collection(db, ORDERS_PATH),
    where('tableId', '==', tableId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() ?? doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() ?? doc.data().updatedAt,
    })) as Order[];
    callback(orders);
  });
};

export const subscribeToMenus = (callback: (menus: MenuItem[]) => void) => {
  return onSnapshot(collection(db, MENUS_PATH), (snapshot) => {
    const menus = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[];
    callback(menus);
  });
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order['status']
) => {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: Timestamp.now(),
  };
  if (status === 'delivered') {
    updates.deliveredAt = Timestamp.now();
  }
  await updateDoc(doc(db, ORDERS_PATH, orderId), updates);
};

export const getMenus = async (): Promise<MenuItem[]> => {
  const snapshot = await getDocs(collection(db, MENUS_PATH));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as MenuItem[];
};

// CRUD Menus
export const createMenu = async (menu: Omit<MenuItem, 'id'>): Promise<string> => {
  try {
    const menuData = {
      name: menu.name,
      description: menu.description || '',
      price: menu.price,
      category: menu.category,
      isAvailable: menu.isAvailable ?? true,
      isPromo: menu.isPromo || false,
      promoPrice: menu.promoPrice || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, MENUS_PATH), menuData);
    return docRef.id;
  } catch (error) {
    console.error('Erreur createMenu:', error);
    throw error;
  }
};

export const updateMenu = async (menuId: string, updates: Partial<MenuItem>): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.isAvailable !== undefined) updateData.isAvailable = updates.isAvailable;
    if (updates.isPromo !== undefined) updateData.isPromo = updates.isPromo;
    if (updates.promoPrice !== undefined) {
      updateData.promoPrice = updates.promoPrice || null;
    }
    
    await updateDoc(doc(db, MENUS_PATH, menuId), updateData);
  } catch (error) {
    console.error('Erreur updateMenu:', error);
    throw error;
  }
};

export const deleteMenu = async (menuId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, MENUS_PATH, menuId));
  } catch (error) {
    console.error('Erreur deleteMenu:', error);
    throw error;
  }
};
