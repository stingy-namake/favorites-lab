import express from 'express';
import cors from 'cors';
import clientesRouter from './routes/clientes.js';
import favoritosRouter from './routes/favoritos.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/clientes', clientesRouter);
app.use('/api/clientes/:id/favoritos', favoritosRouter);

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
