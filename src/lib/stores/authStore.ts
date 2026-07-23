import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type UserRole = 'super-admin' | 'panitia' | 'peserta' | 'field-staff';

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
	token: string | null;
}

const STORAGE_KEY = 'eventgate.auth';

function readStoredAuth(): AuthState {
	const empty: AuthState = { isAuthenticated: false, user: null, token: null };
	if (!browser) return empty;

	const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
	if (!raw) return empty;

	try {
		return JSON.parse(raw) as AuthState;
	} catch {
		return empty;
	}
}

export const authStore = writable<AuthState>(readStoredAuth());

export function setAuth(token: string, user: UserProfile, remember: boolean) {
	const state: AuthState = { isAuthenticated: true, user, token };
	authStore.set(state);

	const storage = remember ? localStorage : sessionStorage;
	storage.setItem(STORAGE_KEY, JSON.stringify(state));
	(remember ? sessionStorage : localStorage).removeItem(STORAGE_KEY);
}

export function clearAuth() {
	authStore.set({ isAuthenticated: false, user: null, token: null });
	localStorage.removeItem(STORAGE_KEY);
	sessionStorage.removeItem(STORAGE_KEY);
}
