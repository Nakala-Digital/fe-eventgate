import { PUBLIC_API_BASE_URL, PUBLIC_APP_NAME, PUBLIC_APP_ENV } from '$env/static/public';

export const ENV = {
	// ponytail: backend router.go currently shadows `/api/v1/*` (only `/health` resolves there) —
	// only the bare `/api` prefix reaches auth/event handlers. Revert to `/api/v1` once that's fixed.
	API_BASE_URL: PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
	APP_NAME: PUBLIC_APP_NAME || 'EventGate',
	APP_ENV: PUBLIC_APP_ENV || 'development'
};
