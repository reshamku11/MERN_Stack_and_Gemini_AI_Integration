import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const preferredModel = process.env.GEMINI_MODEL || '';
let genAI;
if (apiKey) {
	genAI = new GoogleGenerativeAI(apiKey);
}

async function generateWithFallback(prompt) {
	if (!genAI) return null;
	const candidates = [
		preferredModel,
		'gemini-2.5-flash',
		'gemini-2.5-flash-preview-05-20',
		'gemini-2.5-pro-preview-03-25',
		'gemini-1.5-pro-latest',
		'gemini-1.5-pro',
		'gemini-1.0-pro',
		'gemini-pro',
		'gemini-1.5-flash',
	].filter(Boolean);

	for (const modelName of candidates) {
		try {
			const model = genAI.getGenerativeModel({ model: modelName });
			const result = await model.generateContent(prompt);
			return result.response.text();
		} catch (_err) {
			// try next candidate
		}
	}
	return null;
}

export async function summarizeProject(projectName, tasks) {
	const plain = tasks
		.map((t) => `- [${t.status}] ${t.title}: ${t.description || ''}`)
		.join('\n');
	const prompt = `Summarize the current state of the project "${projectName}" given its tasks. Provide a concise status summary and key next steps.\n\nTasks:\n${plain}`;

    if (!genAI) {
		return `Gemini not configured. Summary of ${tasks.length} tasks for ${projectName}.`;
	}
	const text = await generateWithFallback(prompt);
	if (text) return text;
	return 'AI error: No supported Gemini model is available for this API key/region. Set GEMINI_MODEL to a supported model (e.g., gemini-1.0-pro).';
}

export async function answerQuestion(question, card) {
	const context = `Card Title: ${card.title || ''}\nDescription: ${card.description || ''}\nStatus: ${card.status || ''}`;
	const prompt = `You are a project assistant. Using the card context, answer the user's question. If insufficient info, say what is missing.\n\nContext:\n${context}\n\nQuestion: ${question}`;
    if (!genAI) {
		return 'Gemini not configured. Set GEMINI_API_KEY.';
	}
	const text = await generateWithFallback(prompt);
	if (text) return text;
	return 'AI error: No supported Gemini model is available for this API key/region. Set GEMINI_MODEL to a supported model (e.g., gemini-1.0-pro).';
}

// diagnostics helper removed for production



