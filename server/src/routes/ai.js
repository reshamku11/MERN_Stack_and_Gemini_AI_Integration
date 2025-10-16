import { Router } from 'express';
import { summarizeProject, answerQuestion } from '../services/ai.js';

const router = Router();

// Status/diagnostics endpoints removed for production cleanliness

router.post('/summarize', async (req, res) => {
	const { projectName, tasks } = req.body;
	const summary = await summarizeProject(projectName, tasks || []);
	res.json({ summary });
});

router.post('/qa', async (req, res) => {
	const { question, card } = req.body;
	const answer = await answerQuestion(question, card || {});
	res.json({ answer });
});

export default router;




