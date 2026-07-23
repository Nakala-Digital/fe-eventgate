<script lang="ts">
	import { page } from '$app/state';
	import type { UserRole } from '$lib/stores/authStore';
	import { LayoutDashboard, ShieldCheck, Calendar, Users, UserPlus, QrCode, Ticket } from 'lucide-svelte';

	let { role = 'super-admin' }: { role: UserRole } = $props();

	const roleNavs: Record<string, { label: string; href: string; icon: any }[]> = {
		'super-admin': [
			{ label: 'Super Admin Overview', href: '/dashboard/super-admin', icon: LayoutDashboard },
			{ label: 'Event Validation', href: '/dashboard/super-admin/event-validation', icon: ShieldCheck },
			{ label: 'Event Management', href: '/dashboard/super-admin/event-management', icon: Calendar },
			{ label: 'Admin Operasional', href: '/dashboard/super-admin/operasional', icon: Users },
			{ label: 'Create Admin Organizer', href: '/dashboard/super-admin/organizer', icon: UserPlus },
			{ label: 'Participant Management', href: '/dashboard/super-admin/participants', icon: Users },
		],
		'panitia': [
			{ label: 'Admin Organizer Overview', href: '/dashboard/panitia', icon: LayoutDashboard },
			{ label: 'Event Management', href: '/dashboard/panitia/event-management', icon: Calendar },
			{ label: 'Participant Management', href: '/dashboard/panitia/participants', icon: Users },
			{ label: 'Admin Lapangan', href: '/dashboard/panitia/admin-lapangan', icon: Users },
		],
		'peserta': [
			{ label: 'Home User / Tiket Saya', href: '/dashboard/peserta', icon: Ticket },
			{ label: 'Riwayat Registrasi', href: '/dashboard/peserta/history', icon: Calendar },
		],
		'field-staff': [
			{ label: 'Scan QR Operator', href: '/dashboard/field-staff', icon: QrCode },
		]
	};

	const navItems = $derived(roleNavs[role] || roleNavs['super-admin']);
</script>

<aside class="w-64 bg-slate-100 border-r border-slate-200 min-h-[calc(100vh-57px)] p-4 flex flex-col justify-between">
	<div class="space-y-4">
		<!-- Role Badge Header -->
		<div class="px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
			<span class="text-[10px] text-emerald-800 font-medium uppercase block">Role Scope</span>
			<span class="font-bold text-emerald-900 capitalize">{role.replace('-', ' ')}</span>
		</div>

		<!-- Nav Item Links -->
		<nav class="space-y-1">
			{#each navItems as item}
				{@const Icon = item.icon}
				<a
					href={item.href}
					class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all {page.url.pathname === item.href ? 'bg-white text-slate-900 font-semibold shadow-sm border border-slate-200/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'}"
				>
					<Icon class="w-4 h-4 text-emerald-700" />
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>
	</div>

	<div class="pt-4 border-t border-slate-200 text-[11px] text-slate-500">
		<span>EVG-39 Layout & Routing Setup</span>
	</div>
</aside>
