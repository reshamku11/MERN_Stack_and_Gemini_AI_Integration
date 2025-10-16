import { Router } from 'express';
import {
	listTasks,
	createTask,
	updateTask,
	deleteTask,
	reorderTasks,
} from '../controllers/tasksController.js';

const router = Router();

router.get('/', listTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/reorder', reorderTasks);

export default router;




