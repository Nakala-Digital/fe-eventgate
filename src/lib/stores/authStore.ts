import { writable } from 'svelte/store';

export type UserRole = 'super-admin' | 'panitia' | 'peserta' | 'field-staff' | 'guest';

export interface UserProfile {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatarUrl?: string;
}

export interface AuthState {
	isAuthenticated: boolean;
	user: UserProfile | null;
}

const initialAuth: AuthState = {
	isAuthenticated: false,
	user: null
};

export const authStore = writable<AuthState>(initialAuth);

export const setMockUserRole = (role: UserRole) => {
	if (role === 'guest') {
		authStore.set({ isAuthenticated: false, user: null });
		return;
	}

	const roleNames: Record<UserRole, string> = {
		'super-admin': 'Super Administrator',
		'panitia': 'Admin Panitia Event',
		'peserta': 'Peserta Event',
		'field-staff': 'Staf Lapangan (Scan QR)',
		'guest': 'Tamu'
	};

	authStore.set({
		isAuthenticated: true,
		user: {
			id: `user-${role}-001`,
			name: roleNames[role],
			email: `${role}@eventgate.id`,
			role: role
		}
	});
};
