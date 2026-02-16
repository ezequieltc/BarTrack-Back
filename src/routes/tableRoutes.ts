import { Router } from 'express';
import { getTables, getTableDetails, openTable, closeTable, createTable, updateTableStatus } from '../controllers/tableController';

const router = Router();

router.get('/', getTables);
router.post('/', createTable);
router.get('/test', (req, res) => {
    console.log('TEST ENDPOINT HIT');
    res.json({ message: 'Test endpoint works!' });
});
router.post('/:id/open', openTable);
router.post('/:id/close', closeTable);
router.put('/:id/status', updateTableStatus);
router.get('/:id', getTableDetails);

console.log('Table routes registered successfully');

export default router;
