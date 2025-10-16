import { Router } from 'express';
import {
	listProjects,
	getProject,
	createProject,
	updateProject,
	deleteProject,
} from '../controllers/projectsController.js';

const router = Router();

router.get('/', listProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;




