<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authStore, clearAuth, type AuthState, type UserRole } from '$lib/stores/authStore';
	import logo from '$lib/assets/al-azhar-logo.png';
	import {
		LayoutDashboard,
		ShieldCheck,
		Calendar,
		Users,
		UserPlus,
		QrCode,
		Ticket,
		Settings,
		LogOut
	} from 'lucide-svelte';

	let { role = 'super-admin' }: { role: UserRole } = $props();

	let currentAuth = $state<AuthState>({ isAuthenticated: false, user: null, token: null });
	authStore.subscribe((state) => (currentAuth = state));

	const roleNavs: Record<string, { label: string; href: string; icon: any }[]> = {
		'super-admin': [
			{ label: 'Dashboard', href: '/dashboard/super-admin', icon: LayoutDashboard },
			{ label: 'Manajemen Acara', href: '/dashboard/super-admin/event-management', icon: Calendar },
			{ label: 'Validasi Acara', href: '/dashboard/super-admin/event-validation', icon: ShieldCheck },
			{ label: 'Manajemen Peserta', href: '/dashboard/super-admin/participants', icon: Users },
			{ label: 'Kelola Admin', href: '/dashboard/super-admin/organizer', icon: UserPlus }
		],
		panitia: [
			{ label: 'Dashboard', href: '/dashboard/panitia', icon: LayoutDashboard },
			{ label: 'Manajemen Acara', href: '/dashboard/panitia/event-management', icon: Calendar },
			{ label: 'Manajemen Peserta', href: '/dashboard/panitia/participants', icon: Users },
			{ label: 'Admin Lapangan', href: '/dashboard/panitia/admin-lapangan', icon: Users }
		],
		peserta: [
			{ label: 'Home User / Tiket Saya', href: '/dashboard/peserta', icon: Ticket },
			{ label: 'Riwayat Registrasi', href: '/dashboard/peserta/history', icon: Calendar }
		],
		'field-staff': [{ label: 'Scan QR Operator', href: '/dashboard/field-staff', icon: QrCode }],
		'school-reviewer': [{ label: 'School Reviewer Overview', href: '/dashboard/school-reviewer', icon: ShieldCheck }]
	};

	const ROLE_LABELS: Record<string, string> = {
		'super-admin': 'Super Admin',
		panitia: 'Admin Panitia',
		peserta: 'Peserta',
		'field-staff': 'Staf Lapangan',
		'school-reviewer': 'School Reviewer'
	};

	const navItems = $derived(roleNavs[role] || roleNavs['super-admin']);
	const userName = $derived(currentAuth.user?.name || 'Pengguna');
	const initials = $derived(
		userName
			.split(' ')
			.map((w) => w[0])
			.slice(0, 2)
			.join('')
			.toUpperCase()
	);

	function handleLogout() {
		clearAuth();
		goto('/auth/login');
	}
</script>

<aside class="w-64 shrink-0 bg-white border-r border-slate-200 min-h-screen p-4 flex flex-col justify-between">
	<div class="space-y-5">
		<!-- Logo -->
		<a href="/" class="flex items-center gap-2.5 px-1">
			<img src={logo} alt="Eventgate Al-Azhar" class="h-9 w-9 rounded-lg object-cover shadow-sm" />
			<div class="flex flex-col leading-tight">
				<span class="font-extrabold text-sm text-slate-900">Eventgate Al-Azhar</span>
				<span class="text-[11px] text-slate-500">Syifa Budi Parahyangan</span>
			</div>
		</a>

		<div class="space-y-1">
			<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3">Menu Utama</p>
			<nav class="space-y-1">
				{#each navItems as item}
					{@const Icon = item.icon}
					<a
						href={item.href}
						class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors {page.url.pathname ===
						item.href
							? 'bg-brand-700 text-white font-semibold shadow-sm'
							: 'text-slate-700 hover:bg-slate-100'}"
					>
						<Icon class="w-4 h-4 {page.url.pathname === item.href ? 'text-white' : 'text-slate-500'}" />
						<span>{item.label}</span>
					</a>
				{/each}
			</nav>
		</div>
	</div>

	<div class="space-y-3">
		<div class="space-y-1">
			<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3">Akun</p>
			<a href="#pengaturan" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100">
				<Settings class="w-4 h-4 text-slate-500" />
				<span>Pengaturan</span>
			</a>
			<button
				onclick={handleLogout}
				class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 text-left"
			>
				<LogOut class="w-4 h-4" />
				<span>Keluar</span>
			</button>
		</div>

		<div class="flex items-center gap-2.5 bg-brand-50 rounded-lg p-2.5">
			<div class="h-8 w-8 rounded-full bg-brand-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
				{initials}
			</div>
			<div class="leading-tight min-w-0">
				<p class="text-xs font-bold text-slate-900 uppercase truncate">{userName}</p>
				<p class="text-[11px] text-slate-500">{ROLE_LABELS[role] ?? role}</p>
			</div>
		</div>
	</div>
</aside>
