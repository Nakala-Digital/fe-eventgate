<script lang="ts">
	import { page } from '$app/state';
	const eventId = $derived(page.params.id);
</script>

<svelte:head>
	<title>Detail Event - {eventId} | EventGate</title>
</svelte:head>

<div class="py-8 px-6 max-w-5xl mx-auto space-y-6">
	<div class="border-b border-slate-200 pb-4">
		<h1 class="text-xl font-bold text-slate-900">Placeholder: Detail Event ({eventId})</h1>
		<p class="text-xs text-slate-500">Route Path: <code class="text-emerald-700 font-mono">/events/[id]</code></p>
	</div>

	<div class="bg-white border border-slate-200 p-6 rounded-xl space-y-3 shadow-sm">
		<span class="text-xs font-semibold text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Wireframe Reference: WireFrame User - Detail Event</span>
		<p class="text-xs text-slate-600">
			Halaman ini disiapkan sebagai placeholder untuk rincian event, waktu, lokasi, deskripsi, dan formulir pendaftaran dinamis (EVG-30).
		</p>
		<a href="/events" class="text-xs text-emerald-700 hover:underline font-semibold block pt-2">
			← Kembali ke Katalog Event
		</a>
	</div>
</div>
