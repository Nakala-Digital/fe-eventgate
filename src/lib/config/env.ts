import { PUBLIC_API_BASE_URL, PUBLIC_APP_NAME, PUBLIC_APP_ENV } from '$env/static/public';

export const ENV = {
	API_BASE_URL: PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1',
	APP_NAME: PUBLIC_APP_NAME || 'EventGate',
	APP_ENV: PUBLIC_APP_ENV || 'development'
};
