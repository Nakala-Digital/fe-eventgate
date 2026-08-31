import { ENV } from '$lib/config/env';
import { authStore } from '$lib/stores/authStore';
import { get } from 'svelte/store';

export type EventStatus =
	| 'draft'
	| 'pending_approval'
	| 'approved'
	| 'revision_requested'
	| 'published'
	| 'rejected'
	| 'ended';
export type TicketTypeMode = 'gratis' | 'berbayar';

export interface ManagedEvent {
	id: number;
	title: string;
	description: string;
	category: string;
	organizer_name: string;
	location: string;
	start_date: string;
	end_date: string;
	banner_url?: string;
	ticket_type: TicketTypeMode;
	price: number;
	quota: number;
	status: EventStatus;
	created_at: string;
	updated_at: string;
	reject_reason?: string;
}

export interface EventFormData {
	title: string;
	description: string;
	category: string;
	organizer_name: string;
	location: string;
	start_date: string;
	end_date: string;
	banner_url?: string;
	ticket_type: TicketTypeMode;
	price: number;
	quota: number;
}

// Initial mock data set
let mockEvents: ManagedEvent[] = [
	{
		id: 1,
		title: 'Classmeet Al-Azhar 2026',
		description: 'Kompetisi olahraga antar kelas untuk mempererat kebersamaan siswa.',
		category: 'Non-Akademik',
		organizer_name: 'OSIS Al-Azhar',
		location: 'Lapangan Utama Sekolah',
		start_date: '2026-08-10T08:00',
		end_date: '2026-08-10T16:00',
		banner_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
		ticket_type: 'gratis',
		price: 0,
		quota: 500,
		status: 'published',
		created_at: '2026-07-20T09:15:00',
		updated_at: '2026-07-20T09:15:00'
	},
	{
		id: 2,
		title: 'Seminar Motivasi Kelulusan',
		description: 'Seminar persiapan kelulusan dan motivasi karier untuk siswa kelas akhir.',
		category: 'Akademik',
		organizer_name: 'Panitia Guru BK',
		location: 'Aula Serbaguna',
		start_date: '2026-08-15T09:00',
		end_date: '2026-08-15T12:00',
		banner_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
		ticket_type: 'berbayar',
		price: 25000,
		quota: 200,
		status: 'pending_approval',
		created_at: '2026-07-21T13:40:00',
		updated_at: '2026-07-21T13:40:00'
	},
	{
		id: 3,
		title: 'Workshop Modern SvelteKit & UI Design',
		description: 'Pelatihan praktis membangun aplikasi web interaktif dengan Svelte 5 dan Tailwind CSS.',
		category: 'Workshop',
		organizer_name: 'Ekskul Komputer',
		location: 'Lab Komputer 1',
		start_date: '2026-08-20T10:00',
		end_date: '2026-08-20T15:00',
		banner_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
		ticket_type: 'berbayar',
		price: 50000,
		quota: 40,
		status: 'draft',
		created_at: '2026-07-22T10:00:00',
		updated_at: '2026-07-22T10:00:00'
	},
	{
		id: 4,
		title: 'Bazar Ramadhan Kelas',
		description: 'Bazar jajanan antar kelas untuk mengisi bulan Ramadhan.',
		category: 'Non-Akademik',
		organizer_name: 'OSIS Al-Azhar',
		location: 'Halaman Sekolah',
		start_date: '2026-08-01T08:00',
		end_date: '2026-08-01T14:00',
		banner_url: '',
		ticket_type: 'gratis',
		price: 0,
		quota: 1000,
		status: 'rejected',
		created_at: '2026-07-15T08:30:00',
		updated_at: '2026-07-15T08:30:00',
		reject_reason: 'Bentrok dengan jadwal ujian tengah semester.'
	}
];

function delay<T>(value: T, ms = 300): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function getAuthHeader(): Record<string, string> {
	const auth = get(authStore);
	return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
}

// ponytail: be-eventgate returns bare JSON for /auth & /events (no {data: ...} envelope,
// unlike /health which does use one) — unwrap either shape so real responses aren't
// silently mistaken for "no data" and dropped to the mock fallback below.
function unwrap(json: unknown): unknown {
	return json && typeof json === 'object' && 'data' in (json as Record<string, unknown>)
		? (json as Record<string, unknown>).data
		: json;
}

// ponytail: be-eventgate's real Event model uses different field names/shape than
// ManagedEvent (title/banner/start_time/end_time/is_paid, nested organizer, no
// `category`) — translate so real API responses render correctly instead of blank.
// `category` has no backend column yet (out of scope for EVG-46/48, flagged to BE team).
function mapBackendEvent(raw: Record<string, any>): ManagedEvent {
	return {
		id: raw.id,
		title: raw.title,
		description: raw.description,
		category: raw.category ?? 'Umum',
		organizer_name: raw.organizer?.username || raw.created_by_user?.username || 'Tidak diketahui',
		location: raw.location,
		start_date: raw.start_time,
		end_date: raw.end_time,
		banner_url: raw.banner,
		ticket_type: raw.is_paid ? 'berbayar' : 'gratis',
		price: raw.price ?? 0,
		quota: raw.quota,
		status: raw.status,
		created_at: raw.created_at,
		updated_at: raw.updated_at,
		reject_reason: raw.reject_reason
	};
}

export interface ApprovalLogEntry {
	id: number;
	event_id: number;
	action: 'submitted' | 'approved' | 'rejected' | 'revision_requested';
	notes?: string;
	reviewed_at?: string;
}

/**
 * Fetch approval history for an event (EVG-45). Used to recover the reject/revision
 * reason, since the real backend stores it on the log entry, not on the event itself.
 */
export async function getApprovalLogs(eventId: number): Promise<ApprovalLogEntry[]> {
	try {
		const res = await fetch(`${ENV.API_BASE_URL}/events/${eventId}/approval-logs`, {
			headers: { ...getAuthHeader() }
		});
		if (res.ok) {
			const payload = unwrap(await res.json());
			if (Array.isArray(payload)) return payload as ApprovalLogEntry[];
		}
	} catch {
		// No logs available (mock mode or backend unreachable)
	}
	return [];
}

/**
 * Fetch all events (with optional search / organizer filter)
 */
export async function listEvents(params?: {
	organizer?: string;
	status?: string;
	search?: string;
}): Promise<ManagedEvent[]> {
	try {
		const query = new URLSearchParams();
		if (params?.organizer && params.organizer !== 'all') query.set('organizer', params.organizer);
		if (params?.status && params.status !== 'all') query.set('status', params.status);
		if (params?.search) query.set('search', params.search);

		const url = `${ENV.API_BASE_URL}/events?${query.toString()}`;
		const res = await fetch(url, { headers: { ...getAuthHeader() } });

		if (res.ok) {
			const payload = unwrap(await res.json());
			if (Array.isArray(payload)) return payload.map(mapBackendEvent);
		}
	} catch {
		// Fallback to in-memory mock if backend unavailable
	}

	let result = [...mockEvents];

	if (params?.organizer && params.organizer !== 'all') {
		result = result.filter((e) => e.organizer_name.toLowerCase() === params.organizer?.toLowerCase());
	}
	if (params?.status && params.status !== 'all') {
		result = result.filter((e) => e.status === params.status);
	}
	if (params?.search) {
		const term = params.search.toLowerCase();
		result = result.filter(
			(e) =>
				e.title.toLowerCase().includes(term) ||
				e.description.toLowerCase().includes(term) ||
				e.organizer_name.toLowerCase().includes(term) ||
				e.location.toLowerCase().includes(term)
		);
	}

	return delay(result);
}

/**
 * Get event detail by ID
 */
export async function getEventById(id: number): Promise<ManagedEvent> {
	try {
		const res = await fetch(`${ENV.API_BASE_URL}/events/${id}`, {
			headers: { ...getAuthHeader() }
		});
		if (res.ok) {
			const payload = unwrap(await res.json());
			if (payload && typeof payload === 'object') return mapBackendEvent(payload as Record<string, any>);
		}
	} catch {
		// Fallback to mock
	}

	const found = mockEvents.find((e) => e.id === Number(id));
	if (!found) throw new Error('Event tidak ditemukan.');
	return delay({ ...found });
}

function formatToIso(dateStr?: string): string {
	if (!dateStr) return '';
	try {
		const d = new Date(dateStr);
		if (!isNaN(d.getTime())) return d.toISOString();
	} catch {
		// Keep original
	}
	return dateStr;
}

function formatEventPayload(data: EventFormData) {
	const startTimeIso = formatToIso(data.start_date);
	const endTimeIso = formatToIso(data.end_date);
	const banner =
		data.banner_url && data.banner_url.trim()
			? data.banner_url.trim()
			: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80';

	return {
		title: data.title?.trim() ?? '',
		name: data.title?.trim() ?? '',
		description: data.description?.trim() ?? '',
		banner: banner,
		banner_url: banner,
		location: data.location?.trim() ?? '',
		start_time: startTimeIso,
		start_date: startTimeIso,
		end_time: endTimeIso,
		end_date: endTimeIso,
		is_paid: data.ticket_type === 'berbayar',
		ticket_type: data.ticket_type,
		price: data.ticket_type === 'gratis' ? 0 : Number(data.price || 0),
		quota: Number(data.quota || 0),
		category: data.category,
		organizer_name: data.organizer_name?.trim() ?? ''
	};
}

/**
 * Create a new event
 */
export async function createEvent(data: EventFormData): Promise<ManagedEvent> {
	const now = new Date().toISOString();
	const newEvent: ManagedEvent = {
		id: mockEvents.length > 0 ? Math.max(...mockEvents.map((e) => e.id)) + 1 : 1,
		...data,
		price: data.ticket_type === 'gratis' ? 0 : Number(data.price || 0),
		status: 'draft',
		created_at: now,
		updated_at: now
	};

	const payload = formatEventPayload(data);

	try {
		const res = await fetch(`${ENV.API_BASE_URL}/events`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeader()
			},
			body: JSON.stringify(payload)
		});
		if (res.ok) {
			const resJson = await res.json();
			const payloadData = unwrap(resJson);
			if (payloadData && typeof payloadData === 'object') return mapBackendEvent(payloadData as Record<string, any>);
		} else {
			const errBody = await res.json().catch(() => ({ message: '' }));
			const errMsg = errBody.message || errBody.error || `Gagal membuat event (HTTP ${res.status}).`;
			throw new Error(errMsg);
		}
	} catch (err: any) {
		if (err?.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
			throw err;
		}
		// Fallback to mock update if backend is completely unreachable
	}

	mockEvents = [newEvent, ...mockEvents];
	return delay(newEvent);
}

/**
 * Update existing event by ID
 */
export async function updateEvent(id: number, data: EventFormData): Promise<ManagedEvent> {
	const now = new Date().toISOString();
	const payload = formatEventPayload(data);

	try {
		const res = await fetch(`${ENV.API_BASE_URL}/events/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeader()
			},
			body: JSON.stringify(payload)
		});
		if (res.ok) {
			const resJson = await res.json();
			const payloadData = unwrap(resJson);
			if (payloadData && typeof payloadData === 'object') return mapBackendEvent(payloadData as Record<string, any>);
		} else {
			const errBody = await res.json().catch(() => ({ message: '' }));
			const errMsg = errBody.message || errBody.error || `Gagal memperbarui event (HTTP ${res.status}).`;
			throw new Error(errMsg);
		}
	} catch (err: any) {
		if (err?.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
			throw err;
		}
		// Fallback to mock if backend is completely unreachable
	}

	const index = mockEvents.findIndex((e) => e.id === Number(id));
	if (index === -1) throw new Error('Event tidak ditemukan.');

	const updated: ManagedEvent = {
		...mockEvents[index],
		...data,
		price: data.ticket_type === 'gratis' ? 0 : Number(data.price || 0),
		updated_at: now
	};
	mockEvents[index] = updated;
	return delay(updated);
}

/**
 * Delete event by ID
 */
export async function deleteEvent(id: number): Promise<boolean> {
	try {
		const res = await fetch(`${ENV.API_BASE_URL}/events/${id}`, {
			method: 'DELETE',
			headers: { ...getAuthHeader() }
		});
		if (res.ok) return true;
		if (res.status >= 400) {
			const errBody = await res.json().catch(() => ({ message: '' }));
			const errMsg = errBody.message || errBody.error || `Gagal menghapus event (HTTP ${res.status}).`;
			throw new Error(errMsg);
		}
	} catch (err: any) {
		if (err?.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
			throw err;
		}
		// Fallback to mock
	}

	mockEvents = mockEvents.filter((e) => e.id !== Number(id));
	return delay(true);
}

// be-eventgate (EVG-45) exposes one action endpoint per transition instead of a
// generic PATCH .../status — map the target status to the right action route.
const STATUS_ACTION: Partial<Record<EventStatus, string>> = {
	pending_approval: 'submit',
	approved: 'approve',
	rejected: 'reject',
	revision_requested: 'request-revision',
	published: 'publish',
	draft: 'unpublish'
};

/**
 * Update event status (e.g. submit for approval, publish, approve, reject).
 * `reason` is sent as `notes` — required by the backend for reject/request-revision.
 */
export async function updateEventStatus(id: number, status: EventStatus, reason?: string): Promise<ManagedEvent> {
	const action = STATUS_ACTION[status];

	if (action) {
		try {
			const res = await fetch(`${ENV.API_BASE_URL}/events/${id}/${action}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...getAuthHeader()
				},
				body: JSON.stringify({ notes: reason ?? '', reason: reason ?? '' })
			});
			if (res.ok) {
				const payload = unwrap(await res.json());
				if (payload && typeof payload === 'object') {
					const mapped = mapBackendEvent(payload as Record<string, any>);
					if (reason) mapped.reject_reason = reason;
					return mapped;
				}
			} else {
				const errBody = await res.json().catch(() => ({ message: '' }));
				const errMsg = errBody.message || errBody.error || `Aksi status gagal diproses (HTTP ${res.status}).`;
				throw new Error(errMsg);
			}
		} catch (err: any) {
			if (err?.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
				throw err;
			}
			// Fallback to mock if offline
		}
	}

	const index = mockEvents.findIndex((e) => e.id === Number(id));
	if (index === -1) throw new Error('Event tidak ditemukan.');

	mockEvents[index].status = status;
	mockEvents[index].updated_at = new Date().toISOString();
	if (reason) mockEvents[index].reject_reason = reason;
	return delay(mockEvents[index]);
}
