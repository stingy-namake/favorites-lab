export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
}

export interface Favorite {
  id: number;
  user_id: number;
  product_id: number;
}

export interface JwtPayload {
  sub: number;
  role: string;
  exp: number;
}

export type Env = {
  DB: D1Database;
  JWT_SECRET?: string;
};

export type Variables = {
  userId: number;
  userRole: string;
};
