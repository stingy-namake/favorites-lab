export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface FavoriteItem {
  id: number;
  product_id: number;
  product?: Product;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
