import { create } from 'zustand';

export const useStore = create((set) => ({
	projects: [],
	selectedProjectId: null,
	tasks: [],

	setProjects: (projects) => set({ projects, selectedProjectId: projects[0]?._id || null }),
	setSelectedProjectId: (id) => set({ selectedProjectId: id }),
	setTasks: (tasks) => set({ tasks }),
}));




