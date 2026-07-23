<script lang="ts">
	import StatCard from '$lib/components/common/StatCard.svelte';
	import { Users, Calendar, ShieldCheck, UserPlus } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Super Admin Dashboard - EventGate</title>
</svelte:head>

<div class="space-y-6 max-w-5xl">
	<div class="border-b border-slate-200 pb-4">
		<h1 class="text-xl font-bold text-slate-900">Placeholder: Dashboard Super Admin</h1>
		<p class="text-xs text-slate-500">Route Path: <code class="text-emerald-700 font-mono">/dashboard/super-admin</code></p>
	</div>

	<!-- Module Info Card -->
	<div class="bg-white border border-slate-200 p-6 rounded-xl space-y-3 shadow-sm">
		<span class="text-xs font-semibold text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Wireframe Reference: WireFrame Superadmin - Super Admin.png</span>
		<p class="text-xs text-slate-600">
			Halaman ini disiapkan sebagai placeholder untuk overview Super Admin (validasi event, manajemen admin operasional & organizer, serta monitoring sistem).
		</p>
	</div>

	<!-- Simple Overview Stat Cards Placeholder -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<StatCard title="Total Pengguna" value="--" description="Module Placeholder" icon={Users} />
		<StatCard title="Total Event" value="--" description="Module Placeholder" icon={Calendar} />
		<StatCard title="Pending Validasi" value="--" description="Module Placeholder" icon={ShieldCheck} />
		<StatCard title="Admin Organizer" value="--" description="Module Placeholder" icon={UserPlus} />
	</div>

	<!-- Sub-route Placeholder Links -->
	<div class="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm">
		<h3 class="text-xs font-bold text-slate-900 uppercase">Sub-route Placeholder Super Admin:</h3>
		<ul class="text-xs space-y-2 text-emerald-700 font-medium">
			<li><a href="/dashboard/super-admin/event-validation" class="hover:underline">▸ /dashboard/super-admin/event-validation (Wireframe: Event Validation-Super admin.png)</a></li>
			<li><a href="/dashboard/super-admin/event-management" class="hover:underline">▸ /dashboard/super-admin/event-management (Wireframe: Event Management Super Admin.png)</a></li>
			<li><a href="/dashboard/super-admin/operasional" class="hover:underline">▸ /dashboard/super-admin/operasional (Wireframe: admin operasional -Super admin.png)</a></li>
			<li><a href="/dashboard/super-admin/organizer" class="hover:underline">▸ /dashboard/super-admin/organizer (Wireframe: creta admin orginizer.png)</a></li>
			<li><a href="/dashboard/super-admin/participants" class="hover:underline">▸ /dashboard/super-admin/participants (Wireframe: participant management-Super admin.png)</a></li>
		</ul>
	</div>
</div>
