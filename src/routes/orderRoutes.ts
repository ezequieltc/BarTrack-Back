import { Router } from 'express';
import { addOrderToTable, getOrders } from '../controllers/orderController';

const router = Router();

router.post('/table/:tableId', addOrderToTable);
router.get('/', getOrders);

export default router;
