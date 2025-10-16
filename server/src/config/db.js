import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export async function connectToDatabase() {
	if (isConnected) return;
	const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_management_ai';
	try {
		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: 5000,
		});
		isConnected = true;
		console.log('Connected to MongoDB');
	} catch (err) {
		console.error('MongoDB connection failed (continuing to run API):', err.message);
	}
}


