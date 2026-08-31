import { ENV } from '$lib/config/env';

export type RegistrationStatus = 'pending' | 'pending_payment' | 'confirmed' | 'cancelled';

export interface RegistrationAnswer {
	question_id: number;
	label: string;
	value: string;
}

export interface Registration {
	id: number;
	registration_code: string;
	event_id: number;
	participant_name: string;
	participant_email: string;
	answers: RegistrationAnswer[];
	status: RegistrationStatus;
	created_at: string;
}

export interface TicketType {
	id: number;
	event_id: number;
	name: string;
	price: number;
	quota: number;
	sold_count?: number;
}

export interface RegistrationFormData {
	ticket_type_id: number;
	participant_name: string;
	participant_email: string;
	answers: RegistrationAnswer[];
}

function unwrap(json: unknown): unknown {
	return json && typeof json === 'object' && 'data' in (json as Record<string, unknown>)
		? (json as Record<string, unknown>).data
		: json;
}

/**
 * Fetch ticket types for an event
 */
export async function getTicketTypes(eventId: number): Promise<TicketType[]> {
	try {
		const res = await fetch(`${ENV.API_BASE_URL}/events/${eventId}/ticket-types`);
		if (res.ok) {
			const payload = unwrap(await res.json());
			if (Array.isArray(payload) && payload.length > 0) return payload as TicketType[];
		}
	} catch {
		// Fallback
	}

	return [
		{
			id: 1,
			event_id: eventId,
			name: 'Tiket Masuk',
			price: 0,
			quota: 100,
			sold_count: 0
		}
	];
}

/**
 * Submit a registration for an event (EVG-49 / EVG-50).
 * Connects directly to backend POST /api/v1/events/{id}/registrations.
 */
export async function submitRegistration(
	eventId: number,
	data: RegistrationFormData,
	_isPaidEvent?: boolean
): Promise<Registration> {
	const payload = {
		ticket_type_id: Number(data.ticket_type_id),
		participant_name: data.participant_name.trim(),
		participant_email: data.participant_email.trim(),
		answers: data.answers
	};

	const res = await fetch(`${ENV.API_BASE_URL}/events/${eventId}/registrations`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});

	if (res.ok) {
		const resJson = unwrap(await res.json());
		if (resJson && typeof resJson === 'object') return resJson as Registration;
		throw new Error('Format respons pendaftaran tidak valid.');
	}

	const body = await res.json().catch(() => ({ message: '' }));
	const errMsg = body.message || body.error || 'Gagal mengirim pendaftaran.';
	throw new Error(errMsg);
}
