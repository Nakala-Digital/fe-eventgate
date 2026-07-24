<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { getEventById, type ManagedEvent } from '$lib/services/eventApi';
	import { Calendar, MapPin, ArrowLeft, Loader2 } from 'lucide-svelte';

	const eventId = $derived(Number(page.params.id));

	let event = $state<ManagedEvent | null>(null);
	let isLoading = $state(true);
	let notFound = $state(false);

	onMount(loadData);

	async function loadData() {
		isLoading = true;
		notFound = false;
		try {
			const data = await getEventById(eventId);
			// Peserta hanya boleh melihat event yang sudah published.
			event = data.status === 'published' ? data : null;
			if (!event) notFound = true;
		} catch {
			notFound = true;
		} finally {
			isLoading = false;
		}
	}

	function formatDateTime(iso: string) {
		return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
	}
	function formatRupiah(amount: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
			amount
		);
	}
</script>

<svelte:head>
	<title>{event ? event.title : 'Detail Event'} - EventGate</title>
</svelte:head>

<div class="py-8 px-6 max-w-3xl mx-auto space-y-6 w-full">
	<a href="/events" class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
		<ArrowLeft class="w-4 h-4" /> Kembali ke Katalog Event
	</a>

	{#if isLoading}
		<div class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
			<Loader2 class="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
			<p class="text-xs font-semibold text-slate-700">Memuat detail event...</p>
		</div>
	{:else if notFound || !event}
		<div class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
			<p class="text-sm font-bold text-slate-800">Event tidak ditemukan</p>
			<p class="text-xs text-slate-500 mt-1">Event mungkin belum dipublikasikan atau sudah tidak tersedia.</p>
		</div>
	{:else}
		<div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
			{#if event.banner_url}
				<img src={event.banner_url} alt={event.title} class="w-full h-56 object-cover" />
			{:else}
				<div class="w-full h-56 bg-emerald-50 flex items-center justify-center text-emerald-700">
					<Calendar class="w-16 h-16" />
				</div>
			{/if}

			<div class="p-6 space-y-4">
				<div>
					<span class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
						{event.category}
					</span>
					<h1 class="text-xl font-bold text-slate-900 mt-2">{event.title}</h1>
					<p class="text-xs text-slate-500 mt-1">Diselenggarakan oleh {event.organizer_name}</p>
				</div>

				<p class="text-sm text-slate-700">{event.description}</p>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-4">
					<div class="flex items-center gap-2 text-slate-600">
						<Calendar class="w-4 h-4 text-emerald-700 shrink-0" />
						{formatDateTime(event.start_date)} — {formatDateTime(event.end_date)}
					</div>
					<div class="flex items-center gap-2 text-slate-600">
						<MapPin class="w-4 h-4 text-emerald-700 shrink-0" />
						{event.location}
					</div>
				</div>

				<div class="flex items-center justify-between border-t border-slate-100 pt-4">
					<div>
						<p class="text-[11px] text-slate-500">Biaya Tiket</p>
						<p class="text-lg font-bold {event.ticket_type === 'gratis' ? 'text-emerald-700' : 'text-slate-900'}">
							{event.ticket_type === 'gratis' ? 'Gratis' : formatRupiah(event.price)}
						</p>
					</div>
					<a
						href={`/events/${event.id}/register`}
						class="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 rounded-lg shadow-sm"
					>
						Daftar Sekarang
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>
