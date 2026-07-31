<script lang="ts">
	import { onMount } from 'svelte';
	import { listEvents, type ManagedEvent } from '$lib/services/eventApi';
	import { Calendar, MapPin, Search, Loader2, AlertCircle, CalendarX, RefreshCw } from 'lucide-svelte';

	let events = $state<ManagedEvent[]>([]);
	let isLoading = $state(true);
	let hasError = $state(false);
	let searchQuery = $state('');
	let categoryFilter = $state('all');

	onMount(loadData);

	async function loadData() {
		isLoading = true;
		hasError = false;
		try {
			const all = await listEvents();
			events = all.filter((e) => e.status === 'published');
		} catch {
			hasError = true;
		} finally {
			isLoading = false;
		}
	}

	const categories = $derived([...new Set(events.map((e) => e.category))]);

	const filteredEvents = $derived(
		events.filter((e) => {
			if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
			if (searchQuery.trim()) {
				const term = searchQuery.toLowerCase();
				if (!e.title.toLowerCase().includes(term) && !e.location.toLowerCase().includes(term)) return false;
			}
			return true;
		})
	);

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
	}
	function formatRupiah(amount: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
			amount
		);
	}
</script>

<svelte:head>
	<title>Katalog Event - EventGate</title>
</svelte:head>

<div class="py-8 px-6 max-w-6xl mx-auto space-y-6 w-full">
	<div class="border-b border-slate-200 pb-4">
		<h1 class="text-xl font-bold text-slate-900">Katalog Event</h1>
		<p class="text-xs text-slate-500">Temukan dan daftar event yang sedang berlangsung.</p>
	</div>

	<div class="flex flex-col sm:flex-row gap-3">
		<div class="relative flex-1">
			<Search class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari nama event atau lokasi..."
				class="w-full text-xs border border-slate-300 rounded-lg pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
			/>
		</div>
		<select
			bind:value={categoryFilter}
			class="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
		>
			<option value="all">Semua Kategori</option>
			{#each categories as cat}
				<option value={cat}>{cat}</option>
			{/each}
		</select>
	</div>

	{#if isLoading}
		<div class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
			<Loader2 class="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
			<p class="text-xs font-semibold text-slate-700">Memuat daftar event...</p>
		</div>
	{:else if hasError}
		<div class="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700 shadow-sm">
			<AlertCircle class="w-10 h-10 mx-auto mb-2 text-red-500" />
			<h3 class="text-sm font-bold">Gagal Memuat Event</h3>
			<button
				onclick={loadData}
				class="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
			>
				<RefreshCw class="w-3.5 h-3.5" /> Coba Lagi
			</button>
		</div>
	{:else if filteredEvents.length === 0}
		<div class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
			<CalendarX class="w-12 h-12 text-slate-300 mx-auto mb-3" />
			<h3 class="text-sm font-bold text-slate-800">Belum Ada Event</h3>
			<p class="text-xs text-slate-500 mt-1">Tidak ada event yang cocok dengan pencarian/filter kamu.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
			{#each filteredEvents as event (event.id)}
				<a
					href={`/events/${event.id}`}
					class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition block"
				>
					{#if event.banner_url}
						<img src={event.banner_url} alt={event.title} class="w-full h-36 object-cover" />
					{:else}
						<div class="w-full h-36 bg-brand-50 flex items-center justify-center text-brand-700">
							<Calendar class="w-10 h-10" />
						</div>
					{/if}
					<div class="p-4 space-y-2">
						<span class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
							{event.category}
						</span>
						<h3 class="text-sm font-bold text-slate-900 line-clamp-1">{event.title}</h3>
						<div class="flex items-center gap-1.5 text-xs text-slate-500">
							<Calendar class="w-3.5 h-3.5 shrink-0" />
							{formatDate(event.start_date)}
						</div>
						<div class="flex items-center gap-1.5 text-xs text-slate-500">
							<MapPin class="w-3.5 h-3.5 shrink-0" />
							<span class="line-clamp-1">{event.location}</span>
						</div>
						<p class="text-sm font-bold {event.ticket_type === 'gratis' ? 'text-brand-700' : 'text-slate-900'}">
							{event.ticket_type === 'gratis' ? 'Gratis' : formatRupiah(event.price)}
						</p>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
