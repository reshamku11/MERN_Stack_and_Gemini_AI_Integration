import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
	{
		projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
		title: { type: String, required: true, trim: true },
		description: { type: String, default: '' },
		status: { type: String, enum: ['todo', 'inprogress', 'done'], default: 'todo', index: true },
		position: { type: Number, default: 0 },
	},
	{ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

TaskSchema.index({ projectId: 1, status: 1, position: 1 });

export default mongoose.model('Task', TaskSchema);



