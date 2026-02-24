import type { Order } from '../types';

function toDate(value: Date | { seconds: number }): Date {
  return value instanceof Date ? value : new Date(value.seconds * 1000);
}

function isToday(date: Date | { seconds: number }): boolean {
  const d = toDate(date);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export interface DailyStats {
  revenue: number;
  orderCount: number;
  topDish: { name: string; quantity: number } | null;
}

/**
 * Calcule les stats du jour à partir des commandes :
 * - chiffre d'affaires (commandes servies aujourd'hui)
 * - nombre de commandes servies aujourd'hui
 * - plat le plus vendu aujourd'hui
 * Utilise deliveredAt si présent, sinon createdAt pour les anciennes commandes.
 */
export function computeDailyStats(orders: Order[]): DailyStats {
  const deliveredToday = orders.filter((o) => {
    if (o.status !== 'delivered') return false;
    const dateToCheck = o.deliveredAt ?? o.createdAt;
    return isToday(dateToCheck);
  });

  const revenue = deliveredToday.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const orderCount = deliveredToday.length;

  const byDish: Record<string, number> = {};
  for (const order of deliveredToday) {
    for (const item of order.items || []) {
      const name = item.name || 'Inconnu';
      byDish[name] = (byDish[name] || 0) + (item.quantity || 0);
    }
  }

  let topDish: { name: string; quantity: number } | null = null;
  let maxQty = 0;
  for (const [name, qty] of Object.entries(byDish)) {
    if (qty > maxQty) {
      maxQty = qty;
      topDish = { name, quantity: qty };
    }
  }

  return { revenue, orderCount, topDish };
}
