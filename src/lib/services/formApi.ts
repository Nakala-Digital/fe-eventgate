import { ENV } from '$lib/config/env';
import { authStore } from '$lib/stores/authStore';
import { get } from 'svelte/store';

export type QuestionType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'file_upload';
export type QuestionRequirement = 'wajib' | 'opsional';

export interface QuestionOption {
	id: number;
	label: string;
}

export interface DynamicQuestion {
	id: number;
	event_id: number;
	label: string;
	type: QuestionType;
	requirement: QuestionRequirement;
	options: QuestionOption[];
	order: number;
}

export interface QuestionFormData {
	label: string;
	type: QuestionType;
	requirement: QuestionRequirement;
	options: string[];
}

// ponytail: in-memory mock until backend Dynamic Form Schema API (EVG-47) is ready —
// swap the fetch bodies below for real calls once endpoints exist.
// Note: `file_upload` has no column/storage support yet in be-eventgate's DB schema
// (EVG-40 only defines text/textarea/number/date/select/radio/checkbox) — included here
// per ticket EVG-47/48 scope, but backend needs a storage plan before this can persist for real.
let mockQuestions: DynamicQuestion[] = [
	{
		id: 1,
		event_id: 1,
		label: 'Nama Orang Tua/Wali',
		type: 'text',
		requirement: 'wajib',
		options: [],
		order: 1
	},
	{
		id: 2,
		event_id: 1,
		label: 'Kelas',
		type: 'select',
		requirement: 'wajib',
		options: [
			{ id: 1, label: '10' },
			{ id: 2, label: '11' },
			{ id: 3, label: '12' }
		],
		order: 2
	},
	{
		id: 4,
		event_id: 1,
		label: 'Konsumsi Khusus',
		type: 'checkbox',
		requirement: 'opsional',
		options: [
			{ id: 4, label: 'Vegetarian' },
			{ id: 5, label: 'Tanpa Gula' }
		],
		order: 3
	},
	{
		id: 3,
		event_id: 1,
		label: 'Catatan Tambahan',
		type: 'textarea',
		requirement: 'opsional',
		options: [],
		order: 4
	}
];

let nextQuestionId = 5;
let nextOptionId = 6;

function delay<T>(value: T, ms = 300): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function getAuthHeader(): Record<string, string> {
	const auth = get(authStore);
	return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
}

function unwrap(json: unknown): unknown {
	return json && typeof json === 'object' && 'data' in (json as Record<string, unknown>)
		? (json as Record<string, unknown>).data
		: json;
}

// ponytail: be-eventgate's real Dynamic Question model (EVG-47) uses different field
// names (question_text/question_type/requirement_type/display_order/option_label) and
// `dropdown` instead of `select` — translate at the boundary so the rest of the app
// (form builder UI, registration form) keeps using the simpler internal shape.
function mapBackendQuestion(raw: Record<string, any>): DynamicQuestion {
	return {
		id: raw.id,
		event_id: raw.event_id,
		label: raw.question_text,
		type: raw.question_type,
		// `kondisional` (conditional questions) is out of EVG-48 scope — real questions
		// saved as kondisional by another client still render here, treated as opsional.
		requirement: raw.requirement_type === 'wajib' ? 'wajib' : 'opsional',
		options: (raw.options ?? []).map((o: any) => ({ id: o.id, label: o.option_label })),
		order: raw.display_order
	};
}

function toBackendQuestionPayload(data: QuestionFormData, displayOrder?: number) {
	const needsOptions = data.type === 'select' || data.type === 'radio' || data.type === 'checkbox';
	return {
		question_text: data.label,
		question_type: data.type,
		requirement_type: data.requirement,
		...(displayOrder !== undefined ? { display_order: displayOrder } : {}),
		options: needsOptions ? data.options.map((label, i) => ({ option_label: label, option_value: label, display_order: i + 1 })) : []
	};
}

function toQuestion(eventId: number, data: QuestionFormData, id: number, order: number): DynamicQuestion {
	const needsOptions = data.type === 'select' || data.type === 'radio' || data.type === 'checkbox';
	return {
		id,
		event_id: eventId,
		label: data.label,
		type: data.type,
		requirement: data.requirement,
		options: needsOptions ? data.options.map((label) => ({ id: nextOptionId++, label })) : [],
		order
	};
}

export async function listQuestions(eventId: number): Promise<DynamicQuestion[]> {
	try {
		const res = await fetch(`${ENV.API_BASE_URL}/events/${eventId}/questions`, {
			headers: { ...getAuthHeader() }
		});
		if (res.ok) {
			const payload = unwrap(await res.json());
			if (Array.isArray(payload)) return payload.map(mapBackendQuestion).sort((a, b) => a.order - b.order);
		}
	} catch {
		// Fallback to in-memory mock if backend unavailable
	}

	return delay(
		mockQuestions.filter((q) => q.event_id === eventId).sort((a, b) => a.order - b.order)
	);
}

export async function createQuestion(eventId: number, data: QuestionFormData): Promise<DynamicQuestion> {
	try {
		const res = await fetch(`${ENV.API_BASE_URL}/events/${eventId}/questions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
			body: JSON.stringify(toBackendQuestionPayload(data))
		});
		if (res.ok) {
			const payload = unwrap(await res.json());
			if (payload && typeof payload === 'object') return mapBackendQuestion(payload as Record<string, any>);
		} else {
			const errBody = await res.json().catch(() => ({ message: '' }));
			const errMsg = errBody.message || errBody.error || `Gagal membuat pertanyaan (HTTP ${res.status}).`;
			throw new Error(errMsg);
		}
	} catch (err: any) {
		if (err?.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
			throw err;
		}
		// Fallback to mock only if backend is unreachable
	}

	const order = mockQuestions.filter((q) => q.event_id === eventId).length + 1;
	const question = toQuestion(eventId, data, nextQuestionId++, order);
	mockQuestions = [...mockQuestions, question];
	return delay(question);
}

export async function updateQuestion(
	eventId: number,
	questionId: number,
	data: QuestionFormData,
	displayOrder?: number
): Promise<DynamicQuestion> {
	try {
		const res = await fetch(`${ENV.API_BASE_URL}/events/${eventId}/questions/${questionId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
			body: JSON.stringify(toBackendQuestionPayload(data, displayOrder))
		});
		if (res.ok) {
			const payload = unwrap(await res.json());
			if (payload && typeof payload === 'object') return mapBackendQuestion(payload as Record<string, any>);
		} else {
			const errBody = await res.json().catch(() => ({ message: '' }));
			const errMsg = errBody.message || errBody.error || `Gagal memperbarui pertanyaan (HTTP ${res.status}).`;
			throw new Error(errMsg);
		}
	} catch (err: any) {
		if (err?.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
			throw err;
		}
		// Fallback to mock only if backend is unreachable
	}

	const index = mockQuestions.findIndex((q) => q.id === questionId);
	if (index === -1) throw new Error('Pertanyaan tidak ditemukan.');
	const updated = toQuestion(eventId, data, questionId, mockQuestions[index].order);
	mockQuestions[index] = updated;
	return delay(updated);
}

export async function deleteQuestion(eventId: number, questionId: number): Promise<boolean> {
	try {
		const res = await fetch(`${ENV.API_BASE_URL}/events/${eventId}/questions/${questionId}`, {
			method: 'DELETE',
			headers: { ...getAuthHeader() }
		});
		if (res.ok) return true;
		if (res.status >= 400) {
			const errBody = await res.json().catch(() => ({ message: '' }));
			const errMsg = errBody.message || errBody.error || `Gagal menghapus pertanyaan (HTTP ${res.status}).`;
			throw new Error(errMsg);
		}
	} catch (err: any) {
		if (err?.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
			throw err;
		}
		// Fallback to mock
	}

	mockQuestions = mockQuestions.filter((q) => q.id !== questionId);
	return delay(true);
}

/**
 * Move a question up/down in display order by swapping `order` with its neighbor.
 * Against the real backend this re-PUTs both questions (Replace-All strategy —
 * the full question body is required, not just `display_order`).
 */
export async function reorderQuestion(
	eventId: number,
	questionId: number,
	direction: 'up' | 'down',
	currentList: DynamicQuestion[]
): Promise<void> {
	const list = [...currentList].sort((a, b) => a.order - b.order);
	const index = list.findIndex((q) => q.id === questionId);
	const swapIndex = direction === 'up' ? index - 1 : index + 1;
	if (index === -1 || swapIndex < 0 || swapIndex >= list.length) return;

	const a = list[index];
	const b = list[swapIndex];

	await Promise.all([
		updateQuestion(eventId, a.id, { label: a.label, type: a.type, requirement: a.requirement, options: a.options.map((o) => o.label) }, b.order),
		updateQuestion(eventId, b.id, { label: b.label, type: b.type, requirement: b.requirement, options: b.options.map((o) => o.label) }, a.order)
	]);

	// Keep mock array consistent too (no-op against real backend, matters for offline mode).
	const mockA = mockQuestions.find((q) => q.id === a.id);
	const mockB = mockQuestions.find((q) => q.id === b.id);
	if (mockA && mockB) {
		const tmp = mockA.order;
		mockA.order = mockB.order;
		mockB.order = tmp;
	}

	await delay(undefined, 150);
}
