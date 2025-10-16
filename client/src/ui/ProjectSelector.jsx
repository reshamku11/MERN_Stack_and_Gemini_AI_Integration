import React from 'react';
import { useStore } from '../zustand/store.js';

export function ProjectSelector() {
	const { projects, selectedProjectId, setSelectedProjectId } = useStore();
	return (
		<select
			value={selectedProjectId || ''}
			onChange={(e) => setSelectedProjectId(e.target.value)}
		>
			<option value="">Select project...</option>
			{projects.map((p) => (
				<option key={p._id} value={p._id}>{p.name}</option>
			))}
		</select>
	);
}




