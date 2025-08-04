// frontend/src/assets/types.ts

// Tipos de dados para as tabelas do seu backend
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Restaurant {
  id: number;
  name: string;
  external_id: string;
}

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  external_id: string;
  customer_name: string;
  total: number;
  status: 'Entregue' | 'Cancelado' | 'Em andamento' | 'Saiu para entrega';
  data_pedido: string;
  restaurant_name: string;
  items: OrderItem[];
}