import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './routes/auth';
import { products } from './routes/products';
import { cart } from './routes/cart';
import { favorites } from './routes/favorites';
import { admin } from './routes/admin';
import { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.route('/api/auth', auth);
app.route('/api/products', products);
app.route('/api/cart', cart);
app.route('/api/favorites', favorites);
app.route('/api/admin', admin);

app.get('/api/health', (c) => c.json({ status: 'ok' }));

export default app;
