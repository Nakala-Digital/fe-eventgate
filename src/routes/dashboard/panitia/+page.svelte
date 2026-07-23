<script lang="ts">
	import StatCard from '$lib/components/common/StatCard.svelte';
	import { Calendar, Users, FileText, CreditCard } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Dashboard Admin Panitia - EventGate</title>
</svelte:head>

<div class="space-y-6 max-w-5xl">
	<div class="border-b border-slate-200 pb-4">
		<h1 class="text-xl font-bold text-slate-900">Placeholder: Dashboard Admin Organizer (Panitia)</h1>
		<p class="text-xs text-slate-500">Route Path: <code class="text-emerald-700 font-mono">/dashboard/panitia</code></p>
	</div>

	<div class="bg-white border border-slate-200 p-6 rounded-xl space-y-3 shadow-sm">
		<span class="text-xs font-semibold text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Wireframe Reference: WireFrame Admin - Admin Organizer Dashboard.png</span>
		<p class="text-xs text-slate-600">
			Halaman ini disiapkan sebagai placeholder untuk dashboard utama panitia (pembuatan event, form pendaftaran dinamis, pengelolaan peserta, dan tiket).
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<StatCard title="Event Dikelola" value="--" description="Module Placeholder" icon={Calendar} />
		<StatCard title="Total Peserta" value="--" description="Module Placeholder" icon={Users} />
		<StatCard title="Form Dinamis" value="--" description="Module Placeholder" icon={FileText} />
		<StatCard title="Total Pembayaran" value="--" description="Module Placeholder" icon={CreditCard} />
	</div>

	<div class="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm">
		<h3 class="text-xs font-bold text-slate-900 uppercase">Sub-route Placeholder Admin Organizer:</h3>
		<ul class="text-xs space-y-2 text-emerald-700 font-medium">
			<li><a href="/dashboard/panitia/event-management" class="hover:underline">▸ /dashboard/panitia/event-management (Wireframe: Event Management admin Organizer.png)</a></li>
			<li><a href="/dashboard/panitia/participants" class="hover:underline">▸ /dashboard/panitia/participants (Wireframe: Participant Management.png)</a></li>
			<li><a href="/dashboard/panitia/admin-lapangan" class="hover:underline">▸ /dashboard/panitia/admin-lapangan (Wireframe: Admin Lapangan.png)</a></li>
		</ul>
	</div>
</div>
