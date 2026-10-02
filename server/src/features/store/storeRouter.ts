import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import { getOpenStoresController, getMyStoreController, toggleMyStoreController } from './storeController';

const router = Router();

router.get('/open', authMiddleware, getOpenStoresController);
router.get('/me', authMiddleware, roleMiddleware('store'), getMyStoreController);
router.patch('/me/toggle', authMiddleware, roleMiddleware('store'), toggleMyStoreController);

export default router;