<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, type AuthState } from '$lib/stores/authStore';
	import {
		listEvents,
		deleteEvent,
		updateEventStatus,
		type ManagedEvent,
		type EventStatus
	} from '$lib/services/eventApi';
	import ConfirmActionModal from '$lib/components/common/ConfirmActionModal.svelte';
	import {
		Plus,
		Search,
		Calendar,
		MapPin,
		Edit3,
		Trash2,
		Loader2,
		AlertCircle,
		Send,
		Globe,
		Ticket,
		FolderOpen,
		RefreshCw
	} from 'lucide-svelte';

	let currentAuth = $state<AuthState>({ isAuthenticated: false, user: null, token: null });
	authStore.subscribe((state) => (currentAuth = state));

	let events = $state<ManagedEvent[]>([]);
	let isLoading = $state(true);
	let hasError = $state(false);
	let errorMsg = $state('');
	let feedback = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	// Filters
	let searchQuery = $state('');
	let statusFilter = $state<string>('all');
	let categoryFilter = $state<string>('all');

	// Delete Modal State
	let deleteTarget = $state<ManagedEvent | null>(null);
	let isDeleting = $state(false);

	onMount(() => {
		if (currentAuth.user?.role !== 'panitia' && currentAuth.user?.role !== 'super-admin') {
			goto(`/dashboard/${currentAuth.user?.role ?? 'auth/login'}`);
		} else {
			loadData();
		}
	});

	async function loadData() {
		isLoading = true;
		hasError = false;
		errorMsg = '';
		try {
			events = await listEvents();
		} catch (err: any) {
			hasError = true;
			errorMsg = err?.message || 'Gagal memuat daftar event. Silakan periksa koneksi internet Anda.';
		} finally {
			isLoading = false;
		}
	}

	const categories = $derived([...new Set(events.map((e) => e.category))]);

	const filteredEvents = $derived(
		events.filter((e) => {
			if (statusFilter !== 'all' && e.status !== statusFilter) return false;
			if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
			if (searchQuery.trim()) {
				const term = searchQuery.toLowerCase();
				const matchesTitle = e.title.toLowerCase().includes(term);
				const matchesLocation = e.location.toLowerCase().includes(term);
				const matchesDesc = e.description.toLowerCase().includes(term);
				if (!matchesTitle && !matchesLocation && !matchesDesc) return false;
			}
			return true;
		})
	);

	const counts = $derived({
		total: events.length,
		published: events.filter((e) => e.status === 'published').length,
		pending: events.filter((e) => e.status === 'pending_approval').length,
		draftOrRejected: events.filter((e) => e.status === 'draft' || e.status === 'rejected').length
	});

	const statusLabel: Record<EventStatus, string> = {
		draft: 'Draft',
		pending_approval: 'Menunggu Approval',
		approved: 'Disetujui',
		published: 'Dipublikasikan',
		rejected: 'Ditolak',
		ended: 'Selesai'
	};

	const statusClass: Record<EventStatus, string> = {
		draft: 'bg-slate-100 text-slate-700 border-slate-300',
		pending_approval: 'bg-amber-50 text-amber-700 border-amber-200',
		approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
		published: 'bg-blue-50 text-blue-700 border-blue-200',
		rejected: 'bg-red-50 text-red-700 border-red-200',
		ended: 'bg-gray-100 text-gray-600 border-gray-300'
	};

	function formatDate(iso: string) {
		if (!iso) return '-';
		return new Date(iso).toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatRupiah(amount: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
			amount
		);
	}

	function confirmDelete(event: ManagedEvent) {
		deleteTarget = event;
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		isDeleting = true;
		try {
			await deleteEvent(deleteTarget.id);
			feedback = { type: 'success', message: `Event "${deleteTarget.title}" berhasil dihapus.` };
			deleteTarget = null;
			await loadData();
		} catch {
			feedback = { type: 'error', message: 'Gagal menghapus event.' };
		} finally {
			isDeleting = false;
		}
	}

	async function handleStatusChange(id: number, targetStatus: EventStatus) {
		try {
			await updateEventStatus(id, targetStatus);
			const label = statusLabel[targetStatus];
			feedback = { type: 'success', message: `Status event berhasil diubah menjadi ${label}.` };
			await loadData();
		} catch {
			feedback = { type: 'error', message: 'Gagal memperbarui status event.' };
		}
	}
</script>

<svelte:head>
	<title>Event Management - Admin Panitia | EventGate</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
		<div>
			<h1 class="text-xl font-bold text-slate-900">Pengelolaan Event</h1>
			<p class="text-xs text-slate-500">Kelola seluruh event Anda, ajukan approval, atau ubah informasi event.</p>
		</div>
		<button
			onclick={() => goto('/dashboard/panitia/event-management/create')}
			class="flex items-center justify-center gap-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2.5 rounded-lg shadow-sm transition"
		>
			<Plus class="w-4 h-4" /> Buat Event Baru
		</button>
	</div>

	<!-- Alert Toast Feedback -->
	{#if feedback}
		<div
			class="text-xs rounded-lg px-4 py-3 border flex items-center justify-between {feedback.type === 'success'
				? 'bg-emerald-50 text-emerald-800 border-emerald-200'
				: 'bg-red-50 text-red-700 border-red-200'}"
		>
			<span>{feedback.message}</span>
			<button onclick={() => (feedback = null)} class="text-xs font-bold hover:underline">Tutup</button>
		</div>
	{/if}

	<!-- Metric Stat Cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
			<p class="text-xs text-slate-500 font-medium">Total Event</p>
			<p class="text-2xl font-bold text-slate-900 mt-1">{counts.total}</p>
		</div>
		<div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
			<p class="text-xs text-slate-500 font-medium">Dipublikasikan</p>
			<p class="text-2xl font-bold text-blue-600 mt-1">{counts.published}</p>
		</div>
		<div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
			<p class="text-xs text-slate-500 font-medium">Menunggu Approval</p>
			<p class="text-2xl font-bold text-amber-600 mt-1">{counts.pending}</p>
		</div>
		<div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
			<p class="text-xs text-slate-500 font-medium">Draft / Ditolak</p>
			<p class="text-2xl font-bold text-slate-700 mt-1">{counts.draftOrRejected}</p>
		</div>
	</div>

	<!-- Search & Filter Toolbar -->
	<div class="flex flex-col sm:flex-row gap-3">
		<div class="relative flex-1">
			<Search class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari nama event, lokasi, atau deskripsi..."
				class="w-full text-xs border border-slate-300 rounded-lg pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
			/>
		</div>
		<select
			bind:value={statusFilter}
			class="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
		>
			<option value="all">Semua Status</option>
			<option value="draft">Draft</option>
			<option value="pending_approval">Menunggu Approval</option>
			<option value="approved">Disetujui</option>
			<option value="published">Dipublikasikan</option>
			<option value="rejected">Ditolak</option>
		</select>
		<select
			bind:value={categoryFilter}
			class="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
		>
			<option value="all">Semua Kategori</option>
			{#each categories as cat}
				<option value={cat}>{cat}</option>
			{/each}
		</select>
	</div>

	<!-- Event Content Section: Loading, Error, Empty, or Table -->
	{#if isLoading}
		<!-- Loading State -->
		<div class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
			<Loader2 class="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
			<p class="text-xs font-semibold text-slate-700">Memuat Daftar Event...</p>
			<p class="text-[11px] text-slate-400 mt-1">Mengambil data dari server backend</p>
		</div>
	{:else if hasError}
		<!-- Error State -->
		<div class="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700 shadow-sm">
			<AlertCircle class="w-10 h-10 mx-auto mb-2 text-red-500" />
			<h3 class="text-sm font-bold">Gagal Memuat Data Event</h3>
			<p class="text-xs mt-1 text-red-600 max-w-md mx-auto">{errorMsg}</p>
			<button
				onclick={loadData}
				class="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
			>
				<RefreshCw class="w-3.5 h-3.5" /> Coba Lagi
			</button>
		</div>
	{:else if filteredEvents.length === 0}
		<!-- Empty State -->
		<div class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
			<FolderOpen class="w-12 h-12 text-slate-300 mx-auto mb-3" />
			<h3 class="text-sm font-bold text-slate-800">Belum Ada Event</h3>
			<p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
				{searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
					? 'Tidak ada event yang sesuai dengan kriteria pencarian dan filter.'
					: 'Anda belum membuat event apapun. Klik tombol di bawah untuk membuat event baru.'}
			</p>
			{#if searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'}
				<button
					onclick={() => {
						searchQuery = '';
						statusFilter = 'all';
						categoryFilter = 'all';
					}}
					class="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition"
				>
					Reset Filter
				</button>
			{:else}
				<button
					onclick={() => goto('/dashboard/panitia/event-management/create')}
					class="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-lg shadow-sm transition"
				>
					<Plus class="w-4 h-4" /> Buat Event Pertama
				</button>
			{/if}
		</div>
	{:else}
		<!-- Table / List View -->
		<div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
			<table class="w-full text-xs">
				<thead class="bg-slate-50 text-slate-500 uppercase text-[11px] border-b border-slate-200">
					<tr>
						<th class="text-left px-4 py-3 font-semibold">Event</th>
						<th class="text-left px-4 py-3 font-semibold">Waktu & Tempat</th>
						<th class="text-left px-4 py-3 font-semibold">Tipe Tiket</th>
						<th class="text-left px-4 py-3 font-semibold">Status</th>
						<th class="text-right px-4 py-3 font-semibold">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredEvents as event (event.id)}
						<tr class="hover:bg-slate-50 transition">
							<!-- Event Info -->
							<td class="px-4 py-3.5 max-w-xs">
								<div class="flex items-start gap-3">
									{#if event.banner_url}
										<img
											src={event.banner_url}
											alt={event.title}
											class="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
										/>
									{:else}
										<div class="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
											<Calendar class="w-6 h-6" />
										</div>
									{/if}
									<div>
										<h4 class="font-bold text-slate-900 text-xs line-clamp-1">{event.title}</h4>
										<span class="inline-block text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1">
											{event.category}
										</span>
									</div>
								</div>
							</td>

							<!-- Waktu & Tempat -->
							<td class="px-4 py-3.5 text-slate-600">
								<div class="flex items-center gap-1.5 text-slate-700 font-medium">
									<Calendar class="w-3.5 h-3.5 text-slate-400 shrink-0" />
									<span>{formatDate(event.start_date)}</span>
								</div>
								<div class="flex items-center gap-1.5 text-slate-500 mt-1">
									<MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
									<span class="line-clamp-1">{event.location}</span>
								</div>
							</td>

							<!-- Tipe Tiket & Harga -->
							<td class="px-4 py-3.5">
								{#if event.ticket_type === 'berbayar'}
									<div class="font-bold text-slate-900">{formatRupiah(event.price)}</div>
									<span class="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
										Berbayar
									</span>
								{:else}
									<div class="font-bold text-emerald-700">Gratis</div>
									<span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
										Gratis
									</span>
								{/if}
								<p class="text-[10px] text-slate-400 mt-1">Kuota: {event.quota}</p>
							</td>

							<!-- Status Badge -->
							<td class="px-4 py-3.5">
								<span class="inline-block border rounded-full px-2.5 py-1 text-[11px] font-semibold {statusClass[event.status]}">
									{statusLabel[event.status]}
								</span>
								{#if event.status === 'rejected' && event.reject_reason}
									<p class="text-[10px] text-red-600 mt-1 line-clamp-1">
										Alasan: {event.reject_reason}
									</p>
								{/if}
							</td>

							<!-- Actions -->
							<td class="px-4 py-3.5 text-right">
								<div class="flex items-center justify-end gap-1.5">
									<!-- Submit for approval action if draft -->
									{#if event.status === 'draft' || event.status === 'rejected'}
										<button
											onclick={() => handleStatusChange(event.id, 'pending_approval')}
											title="Ajukan Approval"
											class="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
										>
											<Send class="w-3 h-3" /> Ajukan
										</button>
									{/if}

									<!-- Publish action if approved -->
									{#if event.status === 'approved'}
										<button
											onclick={() => handleStatusChange(event.id, 'published')}
											title="Publikasikan Event"
											class="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
										>
											<Globe class="w-3 h-3" /> Publish
										</button>
									{/if}

									<!-- Edit -->
									<button
										onclick={() => goto(`/dashboard/panitia/event-management/${event.id}/edit`)}
										title="Edit Event"
										class="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
									>
										<Edit3 class="w-3.5 h-3.5" />
									</button>

									<!-- Delete -->
									<button
										onclick={() => confirmDelete(event)}
										title="Hapus Event"
										class="p-1.5 rounded-lg text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 transition"
									>
										<Trash2 class="w-3.5 h-3.5" />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Modal Konfirmasi Hapus -->
<ConfirmActionModal
	open={deleteTarget !== null}
	title="Hapus Event?"
	description={deleteTarget
		? `Apakah Anda yakin ingin menghapus event "${deleteTarget.title}"? Tindakan ini tidak dapat dibatalkan.`
		: ''}
	confirmLabel="Ya, Hapus"
	confirmClass="bg-red-600 hover:bg-red-700"
	isSubmitting={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (deleteTarget = null)}
/>
