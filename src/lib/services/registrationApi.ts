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

export interface RegistrationFormData {
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
 * Submit a registration for an event (EVG-49 / EVG-50).
 * Connects directly to backend POST /api/v1/events/{id}/registrations.
 */
export async function submitRegistration(
	eventId: number,
	data: RegistrationFormData,
	_isPaidEvent?: boolean
): Promise<Registration> {
	const res = await fetch(`${ENV.API_BASE_URL}/events/${eventId}/registrations`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});

	if (res.ok) {
		const payload = unwrap(await res.json());
		if (payload && typeof payload === 'object') return payload as Registration;
		throw new Error('Format respons pendaftaran tidak valid.');
	}

	const body = await res.json().catch(() => ({ message: '' }));
	const errMsg = body.message || body.error || 'Gagal mengirim pendaftaran.';
	throw new Error(errMsg);
}
