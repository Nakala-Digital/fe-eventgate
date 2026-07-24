import type { UserProfile, UserRole } from '$lib/stores/authStore';
import { ENV } from '$lib/config/env';

// ponytail: fallback demo accounts used only when the backend is unreachable
// (network error) — mirrors the seed data from be-eventgate's cmd/seeduser.
const DEMO_ACCOUNTS: Record<string, { password: string; role: UserRole; name: string }> = {
	'superadmin@eventgate.com': { password: 'Rahasia123!', role: 'super-admin', name: 'superadmin' },
	'panitia@eventgate.com': { password: 'Rahasia123!', role: 'panitia', name: 'panitia' },
	'staf@eventgate.com': { password: 'Rahasia123!', role: 'field-staff', name: 'staf' },
	'reviewer@eventgate.com': { password: 'Rahasia123!', role: 'school-reviewer', name: 'reviewer' }
};

// Peran `peserta` tidak memiliki akun login (guest registration only) —
// dikonfirmasi resmi oleh backend EVG-41 (Role & Permission Matrix).
const ROLE_NAME_MAP: Record<string, UserRole> = {
	super_admin: 'super-admin',
	admin_panitia: 'panitia',
	staf_lapangan: 'field-staff',
	school_reviewer: 'school-reviewer'
};

interface BackendUser {
	id: number;
	username: string;
	email: string;
	role_name: string;
	is_active: boolean;
}

export class LoginError extends Error {}

export async function login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
	try {
		const res = await fetch(`${ENV.API_BASE_URL}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});

		if (res.ok) {
			const data: { token: string; user: BackendUser } = await res.json();
			return { token: data.token, user: toUserProfile(data.user) };
		}

		if (res.status === 401 || res.status === 403) {
			const body = await res.json().catch(() => ({ error: 'Email atau kata sandi salah.' }));
			throw new LoginError(body.error ?? 'Email atau kata sandi salah.');
		}
	} catch (err) {
		if (err instanceof LoginError) throw err;
		// Network error (backend unreachable) — fall through to demo fallback below.
	}

	await new Promise((resolve) => setTimeout(resolve, 400));
	const account = DEMO_ACCOUNTS[email.trim().toLowerCase()];
	if (!account || account.password !== password) {
		throw new LoginError('Email atau kata sandi salah.');
	}
	return {
		token: `mock-token.${btoa(email)}.${Date.now()}`,
		user: { id: `user-${account.role}-001`, name: account.name, email, role: account.role }
	};
}

function toUserProfile(user: BackendUser): UserProfile {
	const role = ROLE_NAME_MAP[user.role_name];
	if (!role) throw new LoginError(`Role "${user.role_name}" belum didukung di frontend.`);
	return { id: String(user.id), name: user.username, email: user.email, role };
}
