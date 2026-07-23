export type EventApprovalStatus = 'pending_approval' | 'approved' | 'rejected';

export interface PendingEvent {
	event_id: number;
	title: string;
	description: string;
	organizer_name: string;
	location: string;
	start_date: string;
	end_date: string;
	is_paid: boolean;
	price: number;
	quota: number;
	submitted_at: string;
	status: EventApprovalStatus;
	reject_reason?: string;
}

// ponytail: in-memory mock until backend Event Approval API (EVG-45) is ready —
// swap the bodies below for `fetch(ENV.API_BASE_URL + '/events/...')` calls later.
let events: PendingEvent[] = [
	{
		event_id: 1,
		title: 'Classmeet Al-Azhar 2026',
		description: 'Kompetisi olahraga antar kelas untuk mempererat kebersamaan siswa.',
		organizer_name: 'OSIS Al-Azhar',
		location: 'Lapangan Utama Sekolah',
		start_date: '2026-08-10T08:00:00',
		end_date: '2026-08-10T16:00:00',
		is_paid: false,
		price: 0,
		quota: 500,
		submitted_at: '2026-07-20T09:15:00',
		status: 'pending_approval'
	},
	{
		event_id: 2,
		title: 'Seminar Motivasi Kelulusan',
		description: 'Seminar persiapan kelulusan dan motivasi karier untuk siswa kelas akhir.',
		organizer_name: 'Panitia Guru BK',
		location: 'Aula Serbaguna',
		start_date: '2026-08-15T09:00:00',
		end_date: '2026-08-15T12:00:00',
		is_paid: true,
		price: 25000,
		quota: 200,
		submitted_at: '2026-07-21T13:40:00',
		status: 'pending_approval'
	}
];

function delay<T>(value: T): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(value), 300));
}

export async function listPendingEvents(): Promise<PendingEvent[]> {
	return delay(events.filter((e) => e.status === 'pending_approval'));
}

export async function getEventDetail(eventId: number): Promise<PendingEvent | undefined> {
	return delay(events.find((e) => e.event_id === eventId));
}

export async function approveEvent(eventId: number): Promise<PendingEvent> {
	const event = events.find((e) => e.event_id === eventId);
	if (!event) throw new Error('Event tidak ditemukan');
	event.status = 'approved';
	return delay(event);
}

export async function rejectEvent(eventId: number, reason: string): Promise<PendingEvent> {
	const event = events.find((e) => e.event_id === eventId);
	if (!event) throw new Error('Event tidak ditemukan');
	event.status = 'rejected';
	event.reject_reason = reason;
	return delay(event);
}
