export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

export interface OrderItem {
  menuId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalPrice: number;
  createdAt: Date | { seconds: number };
  updatedAt: Date | { seconds: number };
  deliveredAt?: Date | { seconds: number };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  isPromo?: boolean;
  promoPrice?: number;
  promoEndDate?: Date | { seconds: number };
}

export interface CartItem extends OrderItem {
  menuId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export type UserRole = 'client' | 'chef' | 'cashier';
