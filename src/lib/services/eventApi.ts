import { ENV } from '$lib/config/env';
import { authStore } from '$lib/stores/authStore';
import { get } from 'svelte/store';

export type EventStatus = 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected' | 'ended';
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
			if (Array.isArray(payload)) return payload as ManagedEvent[];
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
			if (payload && typeof payload === 'object') return payload as ManagedEvent;
		}
	} catch {
		// Fallback to mock
	}

	const found = mockEvents.find((e) => e.id === Number(id));
	if (!found) throw new Error('Event tidak ditemukan.');
	return delay({ ...found });
}

/**
 * Create a new event
 */
export async function createEvent(data: EventFormData): Promise<ManagedEvent> {
	const now = new Date().toISOString();
	const newEvent: ManagedEvent = {
		id: mockEvents.length > 0 ? Math.max(...mockEvents.map((e) => e.id)) + 1 : 1,
		...data,
		price: data.ticket_type === 'gratis' ? 0 : data.price,
		status: 'draft',
		created_at: now,
		updated_at: now
	};

	try {
		const res = await fetch(`${ENV.API_BASE_URL}/events`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeader()
			},
			body: JSON.stringify(newEvent)
		});
		if (res.ok) {
			const payload = unwrap(await res.json());
			if (payload && typeof payload === 'object') return payload as ManagedEvent;
		}
	} catch {
		// Fallback to mock update
	}

	mockEvents = [newEvent, ...mockEvents];
	return delay(newEvent);
}

/**
 * Update existing event by ID
 */
export async function updateEvent(id: number, data: EventFormData): Promise<ManagedEvent> {
	const now = new Date().toISOString();

	try {
		const res = await fetch(`${ENV.API_BASE_URL}/events/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeader()
			},
			body: JSON.stringify(data)
		});
		if (res.ok) {
			const payload = unwrap(await res.json());
			if (payload && typeof payload === 'object') return payload as ManagedEvent;
		}
	} catch {
		// Fallback to mock
	}

	const index = mockEvents.findIndex((e) => e.id === Number(id));
	if (index === -1) throw new Error('Event tidak ditemukan.');

	const updated: ManagedEvent = {
		...mockEvents[index],
		...data,
		price: data.ticket_type === 'gratis' ? 0 : data.price,
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
	} catch {
		// Fallback to mock
	}

	mockEvents = mockEvents.filter((e) => e.id !== Number(id));
	return delay(true);
}

/**
 * Update event status (e.g. submit for approval, publish, draft, approve, reject).
 * `reason` is required by the approval flow (EVG-46) when rejecting an event.
 */
export async function updateEventStatus(id: number, status: EventStatus, reason?: string): Promise<ManagedEvent> {
	try {
		const res = await fetch(`${ENV.API_BASE_URL}/events/${id}/status`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeader()
			},
			body: JSON.stringify(reason ? { status, reject_reason: reason } : { status })
		});
		if (res.ok) {
			const payload = unwrap(await res.json());
			if (payload && typeof payload === 'object') return payload as ManagedEvent;
		}
	} catch {
		// Fallback to mock
	}

	const index = mockEvents.findIndex((e) => e.id === Number(id));
	if (index === -1) throw new Error('Event tidak ditemukan.');

	mockEvents[index].status = status;
	mockEvents[index].updated_at = new Date().toISOString();
	if (reason) mockEvents[index].reject_reason = reason;
	return delay(mockEvents[index]);
}
