<script lang="ts">
	import { authStore, type AuthState } from '$lib/stores/authStore';
	import logo from '$lib/assets/al-azhar-logo.png';

	let currentAuth = $state<AuthState>({ isAuthenticated: false, user: null, token: null });

	authStore.subscribe((state) => {
		currentAuth = state;
	});
</script>

<header class="bg-white border-b border-slate-200 px-6 py-3">
	<div class="max-w-7xl mx-auto flex items-center justify-between">
		<!-- Brand Logo (Matching wireframe/image.png) -->
		<a href="/" class="flex items-center gap-2.5 font-bold text-lg text-slate-900">
			<img src={logo} alt="Eventgate Al-Azhar" class="h-9 w-9 rounded-lg object-cover shadow-sm" />
			<div class="flex flex-col">
				<span class="font-extrabold text-base tracking-tight leading-none text-slate-900">Eventgate Al-Azhar</span>
				<span class="text-[11px] text-slate-500 font-normal leading-none mt-0.5">Syifa Budi Parahyangan</span>
			</div>
		</a>

		<!-- Basic Nav Links -->
		<nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-700">
			<a href="/" class="hover:text-brand-700 transition-colors">Beranda</a>
			<a href="/events" class="hover:text-brand-700 transition-colors">Katalog Event</a>
		</nav>

		<!-- Auth Link -->
		<div class="flex items-center gap-3 text-xs">
			{#if currentAuth.isAuthenticated}
				<a
					href="/dashboard/{currentAuth.user?.role}"
					class="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
				>
					Dashboard
				</a>
			{:else}
				<a
					href="/auth/login"
					class="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
				>
					Masuk
				</a>
			{/if}
		</div>
	</div>
</header>
