export type EventApprovalStatus = 'pending_approval' | 'approved' | 'rejected';

export interface TicketType {
	name: string;
	price: number;
	quota: number;
}

export interface ApprovalEvent {
	event_id: number;
	title: string;
	description: string;
	category: string;
	organizer_name: string;
	location: string;
	start_date: string;
	end_date: string;
	banner_url?: string;
	ticket_types: TicketType[];
	submitted_at: string;
	status: EventApprovalStatus;
	reject_reason?: string;
}

// ponytail: in-memory mock until backend Event Approval API (EVG-45) is ready —
// swap the bodies below for `fetch(ENV.API_BASE_URL + '/events/...')` calls later.
let events: ApprovalEvent[] = [
	{
		event_id: 1,
		title: 'Classmeet Al-Azhar 2026',
		description: 'Kompetisi olahraga antar kelas untuk mempererat kebersamaan siswa.',
		category: 'Non-Akademik',
		organizer_name: 'OSIS Al-Azhar',
		location: 'Lapangan Utama Sekolah',
		start_date: '2026-08-10T08:00:00',
		end_date: '2026-08-10T16:00:00',
		ticket_types: [{ name: 'Reguler', price: 0, quota: 500 }],
		submitted_at: '2026-07-20T09:15:00',
		status: 'pending_approval'
	},
	{
		event_id: 2,
		title: 'Seminar Motivasi Kelulusan',
		description: 'Seminar persiapan kelulusan dan motivasi karier untuk siswa kelas akhir.',
		category: 'Akademik',
		organizer_name: 'Panitia Guru BK',
		location: 'Aula Serbaguna',
		start_date: '2026-08-15T09:00:00',
		end_date: '2026-08-15T12:00:00',
		ticket_types: [
			{ name: 'Reguler', price: 25000, quota: 180 },
			{ name: 'VIP', price: 50000, quota: 20 }
		],
		submitted_at: '2026-07-21T13:40:00',
		status: 'pending_approval'
	},
	{
		event_id: 3,
		title: 'Konser Musik Angkatan',
		description: 'Konser perpisahan angkatan diisi oleh band internal siswa.',
		category: 'Non-Akademik',
		organizer_name: 'Ekskul Musik',
		location: 'Aula Serbaguna',
		start_date: '2026-08-05T18:00:00',
		end_date: '2026-08-05T21:00:00',
		ticket_types: [{ name: 'Reguler', price: 15000, quota: 300 }],
		submitted_at: '2026-07-18T10:00:00',
		status: 'approved'
	},
	{
		event_id: 4,
		title: 'Bazar Ramadhan Kelas',
		description: 'Bazar jajanan antar kelas untuk mengisi bulan Ramadhan.',
		category: 'Non-Akademik',
		organizer_name: 'OSIS Al-Azhar',
		location: 'Halaman Sekolah',
		start_date: '2026-08-01T08:00:00',
		end_date: '2026-08-01T14:00:00',
		ticket_types: [{ name: 'Reguler', price: 0, quota: 1000 }],
		submitted_at: '2026-07-15T08:30:00',
		status: 'rejected',
		reject_reason: 'Bentrok dengan jadwal ujian tengah semester.'
	}
];

function delay<T>(value: T): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(value), 300));
}

export async function listEvents(): Promise<ApprovalEvent[]> {
	return delay([...events]);
}

export async function getEventDetail(eventId: number): Promise<ApprovalEvent | undefined> {
	return delay(events.find((e) => e.event_id === eventId));
}

export async function approveEvent(eventId: number): Promise<ApprovalEvent> {
	const event = events.find((e) => e.event_id === eventId);
	if (!event) throw new Error('Event tidak ditemukan');
	event.status = 'approved';
	return delay(event);
}

export async function rejectEvent(eventId: number, reason: string): Promise<ApprovalEvent> {
	const event = events.find((e) => e.event_id === eventId);
	if (!event) throw new Error('Event tidak ditemukan');
	event.status = 'rejected';
	event.reject_reason = reason;
	return delay(event);
}
