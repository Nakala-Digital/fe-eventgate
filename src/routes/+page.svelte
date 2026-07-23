<script lang="ts">
	import { Ticket, Calendar, ShieldCheck, QrCode } from 'lucide-svelte';
</script>

<svelte:head>
	<title>EventGate - Platform Management Event</title>
</svelte:head>

<div class="py-12 px-6 max-w-5xl mx-auto space-y-8">
	<!-- Hero Header -->
	<div class="space-y-3 text-center md:text-left border-b border-slate-200 pb-8">
		<span class="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full inline-block">
			Task EVG-39 Frontend Structure & Routing Setup
		</span>
		<h1 class="text-3xl font-extrabold text-slate-900">Platform EventGate</h1>
		<p class="text-xs text-slate-600 max-w-2xl">
			Struktur dasar aplikasi frontend EventGate telah siap. Gunakan menu di bawah ini untuk menguji navigasi antar halaman placeholder untuk setiap role pengguna.
		</p>
	</div>

	<!-- Module Placeholder Links -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<div class="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm">
			<h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
				<Calendar class="w-4 h-4 text-emerald-700" />
				<span>Modul Event Publik</span>
			</h3>
			<p class="text-xs text-slate-600">Halaman beranda publik, katalog event, dan detail event.</p>
			<div class="flex gap-3 pt-1 text-xs font-medium">
				<a href="/events" class="text-emerald-700 hover:underline">Katalog Event →</a>
				<a href="/events/ev-001" class="text-emerald-700 hover:underline">Detail Event →</a>
			</div>
		</div>

		<div class="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm">
			<h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
				<ShieldCheck class="w-4 h-4 text-emerald-700" />
				<span>Modul Auth & Pengguna</span>
			</h3>
			<p class="text-xs text-slate-600">Formulir autentikasi masuk dan registrasi pengguna.</p>
			<div class="flex gap-3 pt-1 text-xs font-medium">
				<a href="/auth/login" class="text-emerald-700 hover:underline">Halaman Login →</a>
				<a href="/auth/register" class="text-emerald-700 hover:underline">Halaman Register →</a>
			</div>
		</div>

		<div class="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm">
			<h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
				<ShieldCheck class="w-4 h-4 text-emerald-700" />
				<span>Portal Super Admin & Organizer</span>
			</h3>
			<p class="text-xs text-slate-600">Dashboard pengelolaan event, validasi, dan manajemen admin.</p>
			<div class="flex gap-3 pt-1 text-xs font-medium">
				<a href="/dashboard/super-admin" class="text-emerald-700 hover:underline">Super Admin →</a>
				<a href="/dashboard/panitia" class="text-emerald-700 hover:underline">Admin Panitia →</a>
			</div>
		</div>

		<div class="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm">
			<h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
				<QrCode class="w-4 h-4 text-emerald-700" />
				<span>Portal Peserta & Operator Scanner</span>
			</h3>
			<p class="text-xs text-slate-600">Portal tiket peserta dan antarmuka pemindaian QR code.</p>
			<div class="flex gap-3 pt-1 text-xs font-medium">
				<a href="/dashboard/peserta" class="text-emerald-700 hover:underline">Portal Peserta →</a>
				<a href="/dashboard/field-staff" class="text-emerald-700 hover:underline">Operator Scanner →</a>
			</div>
		</div>
	</div>
</div>
