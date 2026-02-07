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
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
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
  promoEndDate?: Date;
}

export interface Table {
  id: string;
  name: string;
  status: 'available' | 'occupied';
}

export type UserRole = 'chef' | 'cashier';
