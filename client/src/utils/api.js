import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export async function fetchProjects() {
	const { data } = await api.get('/projects');
	return data;
}

export async function createProject(payload) {
    const { data } = await api.post('/projects', payload);
    return data;
}

export async function updateProject(projectId, payload) {
    const { data } = await api.put(`/projects/${projectId}`, payload);
    return data;
}

export async function deleteProject(projectId) {
    await api.delete(`/projects/${projectId}`);
}

export async function fetchTasks(projectId) {
	const { data } = await api.get('/tasks', { params: { projectId } });
	return data;
}

export async function createTask(payload) {
	const { data } = await api.post('/tasks', payload);
	return data;
}

export async function updateTask(id, payload) {
	const { data } = await api.put(`/tasks/${id}`, payload);
	return data;
}

export async function deleteTask(id) {
    await api.delete(`/tasks/${id}`);
}

export async function reorderTasks(payload) {
	const { data } = await api.post('/tasks/reorder', payload);
	return data;
}

export async function summarizeProject(projectName, tasks) {
	const { data } = await api.post('/ai/summarize', { projectName, tasks });
	return data.summary;
}

export async function askQuestion(question, card) {
	const { data } = await api.post('/ai/qa', { question, card });
	return data.answer;
}



