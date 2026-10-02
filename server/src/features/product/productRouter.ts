import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import { getProductsByStoreController, createProductController, updateProductController } from './productController';

const router = Router();

router.get('/store/:storeId', authMiddleware, getProductsByStoreController);
router.post('/', authMiddleware, roleMiddleware('store'), createProductController);
router.patch('/:id', authMiddleware, roleMiddleware('store'), updateProductController);

export default router;