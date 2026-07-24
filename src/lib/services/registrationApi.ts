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

// ponytail: in-memory mock until backend Participant Registration API (EVG-49) is ready —
// swap the fetch body below for a real call once the endpoint exists.
let mockRegistrations: Registration[] = [];
let nextId = 1;

function delay<T>(value: T, ms = 300): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function unwrap(json: unknown): unknown {
	return json && typeof json === 'object' && 'data' in (json as Record<string, unknown>)
		? (json as Record<string, unknown>).data
		: json;
}

function generateCode(): string {
	const random = Math.random().toString(36).slice(2, 8).toUpperCase();
	return `EVG-${random}`;
}

/**
 * Submit a registration for an event. `isPaidEvent` determines the initial status:
 * gratis -> confirmed immediately, berbayar -> pending_payment (menunggu pembayaran).
 */
export async function submitRegistration(
	eventId: number,
	data: RegistrationFormData,
	isPaidEvent: boolean
): Promise<Registration> {
	try {
		const res = await fetch(`${ENV.API_BASE_URL}/events/${eventId}/registrations`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (res.ok) {
			const payload = unwrap(await res.json());
			if (payload && typeof payload === 'object') return payload as Registration;
		}
	} catch {
		// Fallback to mock
	}

	const registration: Registration = {
		id: nextId++,
		registration_code: generateCode(),
		event_id: eventId,
		participant_name: data.participant_name,
		participant_email: data.participant_email,
		answers: data.answers,
		status: isPaidEvent ? 'pending_payment' : 'confirmed',
		created_at: new Date().toISOString()
	};
	mockRegistrations = [...mockRegistrations, registration];
	return delay(registration);
}
