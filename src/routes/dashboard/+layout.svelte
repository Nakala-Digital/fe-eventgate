<script lang="ts">
	import { page } from '$app/state';
	import Sidebar from '$lib/components/common/Sidebar.svelte';
	import { authStore, setMockUserRole, type UserRole } from '$lib/stores/authStore';
	import { Ticket } from 'lucide-svelte';

	let { children } = $props();

	let currentAuth = $state({ isAuthenticated: false, user: null as any });

	authStore.subscribe((state) => {
		currentAuth = state;
	});

	const currentRole = $derived.by(() => {
		const path = page.url.pathname;
		if (path.includes('super-admin')) return 'super-admin';
		if (path.includes('panitia')) return 'panitia';
		if (path.includes('peserta')) return 'peserta';
		if (path.includes('field-staff')) return 'field-staff';
		return currentAuth.user?.role || 'super-admin';
	});
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
			<span class="text-[11px] text-slate-500 font-medium">Pilih Role:</span>
			<select
				class="bg-slate-50 border border-slate-300 text-xs text-emerald-800 font-semibold rounded px-2.5 py-1 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
				value={currentRole}
				onchange={(e) => {
					const val = (e.target as HTMLSelectElement).value as UserRole;
					setMockUserRole(val);
					window.location.href = `/dashboard/${val}`;
				}}
			>
				<option value="super-admin">Super Admin</option>
				<option value="panitia">Admin Panitia</option>
				<option value="peserta">Peserta</option>
				<option value="field-staff">Staf Lapangan</option>
			</select>
		</div>
	</header>

	<!-- Main Body with Sidebar -->
	<div class="flex-1 flex">
		<Sidebar role={currentRole as UserRole} />

		<main class="flex-1 p-6 overflow-y-auto bg-slate-50">
			{@render children()}
		</main>
	</div>
</div>
