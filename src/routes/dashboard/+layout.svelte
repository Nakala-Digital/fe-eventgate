<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Sidebar from '$lib/components/common/Sidebar.svelte';
	import { authStore, clearAuth, type AuthState } from '$lib/stores/authStore';
	import { Ticket, LogOut } from 'lucide-svelte';

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

	function handleLogout() {
		clearAuth();
		goto('/auth/login');
	}

	const currentRole = $derived(currentAuth.user?.role ?? 'super-admin');
</script>

<div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
	<!-- Dashboard Base Top Bar (Light Mode) -->
	<header class="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between sticky top-0 z-40">
		<div class="flex items-center gap-3">
			<a href="/" class="flex items-center gap-2 font-bold text-base text-slate-900">
				<div class="h-7 w-7 rounded bg-emerald-700 flex items-center justify-center text-white">
					<Ticket class="w-3.5 h-3.5" />
				</div>
				<span class="font-extrabold text-slate-900">EventGate Dashboard</span>
			</a>
		</div>

		<div class="flex items-center gap-3 text-xs">
			<span class="text-slate-700 font-semibold">{currentAuth.user?.name}</span>
			<button
				onclick={handleLogout}
				class="flex items-center gap-1.5 text-slate-500 hover:text-red-600 font-medium px-2.5 py-1 rounded hover:bg-red-50 transition-colors"
			>
				<LogOut class="w-3.5 h-3.5" />
				Keluar
			</button>
		</div>
	</header>

	<!-- Main Body with Sidebar -->
	<div class="flex-1 flex">
		<Sidebar role={currentRole} />

		<main class="flex-1 p-6 overflow-y-auto bg-slate-50">
			{@render children()}
		</main>
	</div>
</div>
