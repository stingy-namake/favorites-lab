import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import favoritesRouter from './routes/favorites.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/favorites', favoritesRouter);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
