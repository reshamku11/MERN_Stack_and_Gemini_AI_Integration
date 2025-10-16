import Project from '../models/Project.js';
import Task from '../models/Task.js';

export async function listProjects(_req, res) {
	const projects = await Project.find({}).sort({ createdAt: -1 });
	res.json(projects);
}

export async function getProject(req, res) {
	const project = await Project.findById(req.params.id);
	if (!project) return res.status(404).json({ message: 'Project not found' });
	res.json(project);
}

export async function createProject(req, res) {
	const { name, description } = req.body;
	const project = await Project.create({ name, description });
	res.status(201).json(project);
}

export async function updateProject(req, res) {
	const { name, description } = req.body;
	const project = await Project.findByIdAndUpdate(
		req.params.id,
		{ name, description },
		{ new: true }
	);
	if (!project) return res.status(404).json({ message: 'Project not found' });
	res.json(project);
}

export async function deleteProject(req, res) {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Project not found' });
    await Task.deleteMany({ projectId: req.params.id });
    res.status(204).send();
}



