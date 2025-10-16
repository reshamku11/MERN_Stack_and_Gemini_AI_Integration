import Task from '../models/Task.js';

export async function listTasks(req, res) {
	const { projectId } = req.query;
	const filter = projectId ? { projectId } : {};
	const tasks = await Task.find(filter).sort({ status: 1, position: 1, createdAt: -1 });
	res.json(tasks);
}

export async function createTask(req, res) {
	const { projectId, title, description, status } = req.body;
	const maxPos = await Task.find({ projectId, status }).sort({ position: -1 }).limit(1);
	const nextPos = maxPos.length ? maxPos[0].position + 1 : 0;
	const task = await Task.create({ projectId, title, description, status: status || 'todo', position: nextPos });
	res.status(201).json(task);
}

export async function updateTask(req, res) {
	const { title, description, status, position } = req.body;
	const task = await Task.findByIdAndUpdate(
		req.params.id,
		{ title, description, status, position },
		{ new: true }
	);
	if (!task) return res.status(404).json({ message: 'Task not found' });
	res.json(task);
}

export async function deleteTask(req, res) {
	const result = await Task.findByIdAndDelete(req.params.id);
	if (!result) return res.status(404).json({ message: 'Task not found' });
	res.status(204).send();
}

export async function reorderTasks(req, res) {
	const { projectId, fromStatus, toStatus, orderedIds } = req.body;
	if (!Array.isArray(orderedIds)) return res.status(400).json({ message: 'orderedIds required' });
	const statusToUse = toStatus || fromStatus;
	await Promise.all(
		orderedIds.map((id, index) =>
			Task.findByIdAndUpdate(id, { status: statusToUse, position: index })
		)
	);
	const tasks = await Task.find({ projectId }).sort({ status: 1, position: 1 });
	res.json(tasks);
}




