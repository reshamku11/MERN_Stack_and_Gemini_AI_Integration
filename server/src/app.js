import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectToDatabase } from './config/db.js';
import projectRouter from './routes/projects.js';
import taskRouter from './routes/tasks.js';
import aiRouter from './routes/ai.js';

connectToDatabase();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/ai', aiRouter);

app.use((err, _req, res, _next) => {
	console.error(err);
	res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

export default app;



