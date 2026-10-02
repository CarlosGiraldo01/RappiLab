import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import { createOrderController, getMyOrdersController, getStoreOrdersController ,getAvailableOrdersController, getMyDeliveriesController, acceptOrderController, releaseOrderController, markDeliveredController } from './orderController';

const router = Router();

router.post('/', authMiddleware, roleMiddleware('consumer'), createOrderController);
router.get('/my', authMiddleware, roleMiddleware('consumer'), getMyOrdersController);
router.get('/store', authMiddleware, roleMiddleware('store'), getStoreOrdersController);
router.get('/available', authMiddleware, roleMiddleware('delivery'), getAvailableOrdersController);
router.get('/delivery/mine', authMiddleware, roleMiddleware('delivery'), getMyDeliveriesController);
router.patch('/:id/accept', authMiddleware, roleMiddleware('delivery'), acceptOrderController);
router.patch('/:id/release', authMiddleware, roleMiddleware('delivery'), releaseOrderController);
router.patch('/:id/deliver', authMiddleware, roleMiddleware('delivery'), markDeliveredController);

export default router;