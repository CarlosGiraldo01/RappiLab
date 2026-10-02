import express from 'express';
import cors from 'cors';
import { pool } from './config/database';
import { PORT } from './config';
import authRouter from './features/auth/authRouter';
import storeRouter from './features/store/storeRouter';
import productRouter from './features/product/productRouter'
import orderRouter from './features/order/orderRouter';
import { errorMiddleware } from './middlewares/errorMiddleware';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.json({ ok: true, dbTime: result.rows[0].now });
});

app.use('/api/auth', authRouter);
app.use('/api/stores', storeRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

app.use(errorMiddleware); 

app.listen(PORT, () => console.log(`Server runing on the port: ${PORT}`));