import {
  collection,
  doc,
  setDoc,
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
const TABLE_LOCKS_PATH = `restaurants/${RESTAURANT_ID}/tableLocks`;
const TABLES_LIST_DOC = doc(
  db,
  'restaurants',
  RESTAURANT_ID,
  'config',
  'tablesList'
);
const CHAT_PATH = `restaurants/${RESTAURANT_ID}/chat`;

export type TableItem = { id: string; name: string };

export type ChatSender = 'chef' | 'cashier';
export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  createdAt: Date | { seconds: number };
}

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

// Table lock (code verrouillage)
export const setTableLock = async (
  tableId: string,
  code: string
): Promise<void> => {
  await setDoc(doc(db, TABLE_LOCKS_PATH, tableId), { code });
};

export const getTableLock = async (
  tableId: string
): Promise<string | null> => {
  const snap = await getDoc(doc(db, TABLE_LOCKS_PATH, tableId));
  const data = snap.data();
  return data?.code ?? null;
};

export const clearTableLock = async (tableId: string): Promise<void> => {
  await deleteDoc(doc(db, TABLE_LOCKS_PATH, tableId));
};

export const subscribeToTableLocks = (
  callback: (tableIdsWithLock: Set<string>) => void
) => {
  return onSnapshot(collection(db, TABLE_LOCKS_PATH), (snapshot) => {
    const set = new Set<string>();
    snapshot.docs.forEach((d) => set.add(d.id));
    callback(set);
  });
};

// Liste des tables du resto (caissière : ajout/suppression)
export const subscribeToTablesList = (
  callback: (tables: TableItem[]) => void
) => {
  return onSnapshot(TABLES_LIST_DOC, (snap) => {
    const data = snap.data();
    const list = Array.isArray(data?.list) ? data.list : [];
    callback(list as TableItem[]);
  });
};

export const setTablesList = async (
  tables: TableItem[]
): Promise<void> => {
  await setDoc(TABLES_LIST_DOC, { list: tables });
};

export const addTable = async (name: string): Promise<string> => {
  const snap = await getDoc(TABLES_LIST_DOC);
  const data = snap.data();
  const list = (Array.isArray(data?.list) ? data.list : []) as TableItem[];
  const maxId = list.reduce((m, t) => {
    const n = parseInt(t.id, 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 0);
  const id = String(maxId + 1);
  await setDoc(TABLES_LIST_DOC, {
    list: [...list, { id, name: name.trim() || id }],
  });
  return id;
};

export const removeTable = async (tableId: string): Promise<void> => {
  const snap = await getDoc(TABLES_LIST_DOC);
  const data = snap.data();
  const list = (Array.isArray(data?.list) ? data.list : []) as TableItem[];
  const next = list.filter((t) => t.id !== tableId);
  await setDoc(TABLES_LIST_DOC, { list: next });
};

// Chat chef ↔ caissière
export const sendChatMessage = async (
  sender: ChatSender,
  text: string
): Promise<void> => {
  const trimmed = text.trim();
  if (!trimmed) return;
  await addDoc(collection(db, CHAT_PATH), {
    sender,
    text: trimmed,
    createdAt: Timestamp.now(),
  });
};

export const subscribeToChatMessages = (
  callback: (messages: ChatMessage[]) => void
) => {
  const q = query(
    collection(db, CHAT_PATH),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        sender: data.sender as ChatSender,
        text: data.text,
        createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
      };
    }) as ChatMessage[];
    callback(messages);
  });
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
