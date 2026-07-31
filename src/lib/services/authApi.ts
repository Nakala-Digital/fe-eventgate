import type { UserProfile, UserRole } from '$lib/stores/authStore';

// ponytail: mock login until backend auth (EVG-41) is ready — swap the body
// of this function for a real `fetch(ENV.API_BASE_URL + '/auth/login')` call.
const DEMO_ACCOUNTS: Record<string, { password: string; role: UserRole; name: string }> = {
	'superadmin@eventgate.id': { password: 'password123', role: 'super-admin', name: 'Super Administrator' },
	'panitia@eventgate.id': { password: 'password123', role: 'panitia', name: 'Admin Panitia Event' },
	'peserta@eventgate.id': { password: 'password123', role: 'peserta', name: 'Peserta Event' },
	'staff@eventgate.id': { password: 'password123', role: 'field-staff', name: 'Staf Lapangan' }
};

export class LoginError extends Error {}

export async function login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
	await new Promise((resolve) => setTimeout(resolve, 400));

	const account = DEMO_ACCOUNTS[email.trim().toLowerCase()];
	if (!account || account.password !== password) {
		throw new LoginError('Email atau kata sandi salah.');
	}

	return {
		token: `mock-token.${btoa(email)}.${Date.now()}`,
		user: {
			id: `user-${account.role}-001`,
			name: account.name,
			email,
			role: account.role
		}
	};
}
