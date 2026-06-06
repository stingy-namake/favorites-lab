import express from 'express';
import cors from 'cors';
import customersRouter from './routes/customers.js';
import favoritesRouter from './routes/favorites.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/customers', customersRouter);
app.use('/api/customers/:id/favorites', favoritesRouter);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
