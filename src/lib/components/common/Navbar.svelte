<script lang="ts">
	import { authStore, setMockUserRole, type UserRole } from '$lib/stores/authStore';
	import { Ticket } from 'lucide-svelte';

	let currentAuth = $state({ isAuthenticated: false, user: null as any });

	authStore.subscribe((state) => {
		currentAuth = state;
	});

	function handleRoleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		setMockUserRole(target.value as UserRole);
	}
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
			<div class="h-4 w-px bg-slate-200"></div>
			<span class="text-[11px] text-slate-400 uppercase font-medium">Role Demo:</span>
			<select
				class="bg-slate-50 border border-slate-300 text-xs text-emerald-800 font-semibold rounded px-2.5 py-1 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
				onchange={handleRoleChange}
			>
				<option value="guest">Guest / Public</option>
				<option value="super-admin">Super Admin</option>
				<option value="panitia">Admin Panitia</option>
				<option value="peserta">Peserta</option>
				<option value="field-staff">Staf Lapangan</option>
			</select>
		</nav>

		<!-- Auth Link (Matching Emerald Green button in wireframe/image.png) -->
		<div class="flex items-center gap-3 text-xs">
			<a
				href="/auth/login"
				class="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
			>
				Masuk
			</a>
		</div>
	</div>
</header>
