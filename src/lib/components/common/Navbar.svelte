<script lang="ts">
	import { authStore, type AuthState } from '$lib/stores/authStore';
	import { Ticket } from 'lucide-svelte';

	let currentAuth = $state<AuthState>({ isAuthenticated: false, user: null, token: null });

	authStore.subscribe((state) => {
		currentAuth = state;
	});
</script>

<header class="bg-white border-b border-slate-200 px-6 py-3">
	<div class="max-w-7xl mx-auto flex items-center justify-between">
		<!-- Brand Logo (Matching wireframe/image.png) -->
		<a href="/" class="flex items-center gap-2.5 font-bold text-lg text-slate-900">
			<div class="h-8 w-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-sm">
				<Ticket class="w-4 h-4" />
			</div>
			<div class="flex flex-col">
				<span class="font-extrabold text-lg tracking-tight leading-none text-slate-900">EventGate</span>
				<span class="text-[10px] text-slate-500 font-normal leading-none">Syifa Budi Parahyangan</span>
			</div>
		</a>

		<!-- Basic Nav Links -->
		<nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-700">
			<a href="/" class="hover:text-emerald-700 transition-colors">Beranda</a>
			<a href="/events" class="hover:text-emerald-700 transition-colors">Katalog Event</a>
		</nav>

		<!-- Auth Link (Matching Emerald Green button in wireframe/image.png) -->
		<div class="flex items-center gap-3 text-xs">
			{#if currentAuth.isAuthenticated}
				<a
					href="/dashboard/{currentAuth.user?.role}"
					class="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
				>
					Dashboard
				</a>
			{:else}
				<a
					href="/auth/login"
					class="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
				>
					Masuk
				</a>
			{/if}
		</div>
	</div>
</header>
