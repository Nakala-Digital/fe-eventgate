<script lang="ts">
	import StatCard from '$lib/components/common/StatCard.svelte';
	import { QrCode, UserCheck } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Scan QR Operator - EventGate</title>
</svelte:head>

<div class="space-y-6 max-w-5xl">
	<div class="border-b border-slate-200 pb-4">
		<h1 class="text-xl font-bold text-slate-900">Placeholder: Operator Scanner QR Code</h1>
		<p class="text-xs text-slate-500">Route Path: <code class="text-emerald-700 font-mono">/dashboard/field-staff</code></p>
	</div>

	<div class="bg-white border border-slate-200 p-6 rounded-xl space-y-3 shadow-sm">
		<span class="text-xs font-semibold text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Wireframe Reference: WireFrame Scanner - Scan QR.png</span>
		<p class="text-xs text-slate-600">
			Halaman ini disiapkan sebagai placeholder untuk modul pemindaian QR Code tiket di gate masuk event oleh staf lapangan (EVG-31).
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<StatCard title="Total Check-in" value="--" description="Module Placeholder" icon={UserCheck} />
		<StatCard title="Status Scanner" value="Ready" description="Module Placeholder" icon={QrCode} />
	</div>
</div>
