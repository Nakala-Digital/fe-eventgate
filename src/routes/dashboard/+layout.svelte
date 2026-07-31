<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Sidebar from '$lib/components/common/Sidebar.svelte';
	import { authStore, type AuthState } from '$lib/stores/authStore';

	let { children } = $props();

	let currentAuth = $state<AuthState>({ isAuthenticated: false, user: null, token: null });

	authStore.subscribe((state) => {
		currentAuth = state;
	});

	onMount(() => {
		if (!currentAuth.isAuthenticated) {
			goto('/auth/login');
		}
	});

	const currentRole = $derived(currentAuth.user?.role ?? 'super-admin');
</script>

<div class="min-h-screen bg-slate-50 text-slate-900 flex">
	<Sidebar role={currentRole} />

	<main class="flex-1 p-8 overflow-y-auto">
		{@render children()}
	</main>
</div>
