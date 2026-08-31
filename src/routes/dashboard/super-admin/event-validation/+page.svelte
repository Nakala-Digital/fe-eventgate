<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, type AuthState } from '$lib/stores/authStore';
	import { listEvents, updateEventStatus, type ManagedEvent, type EventStatus } from '$lib/services/eventApi';
	import {
		Search,
		Calendar,
		AlertCircle,
		FolderOpen,
		RefreshCw,
		CheckCircle2,
		XCircle,
		X,
		ChevronLeft,
		ChevronRight,
		Loader2
	} from 'lucide-svelte';

	// Halaman validasi menampilkan event dalam siklus persetujuan (default: pending, approved, rejected, revision)
	const APPROVAL_STATUSES = ['pending_approval', 'approved', 'rejected', 'revision_requested'] as const;

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

	// Pagination
	let currentPage = $state(1);
	const pageSize = 5;

	// Review Modal State (Frame "Review" di Figma)
	let reviewModalEvent = $state<ManagedEvent | null>(null);
	let reviewReason = $state('');
	let validationError = $state('');
	let isSubmitting = $state(false);

	onMount(() => {
		if (currentAuth.user?.role !== 'super-admin') {
			goto(`/dashboard/${currentAuth.user?.role ?? 'auth/login'}`);
		} else {
			refreshList();
		}
	});

	async function refreshList() {
		isLoading = true;
		hasError = false;
		errorMsg = '';
		try {
			const all = await listEvents();
			events = all.filter((e) => APPROVAL_STATUSES.includes(e.status as any));
		} catch (err: any) {
			hasError = true;
			errorMsg = err?.message || 'Gagal memuat daftar validasi acara. Silakan coba lagi.';
		} finally {
			isLoading = false;
		}
	}

	const filteredEvents = $derived(
		events.filter((e) => {
			if (statusFilter !== 'all' && e.status !== statusFilter) return false;
			if (searchQuery.trim()) {
				const term = searchQuery.toLowerCase();
				const matchesTitle = e.title.toLowerCase().includes(term);
				const matchesOrg = e.organizer_name.toLowerCase().includes(term);
				const matchesCat = e.category.toLowerCase().includes(term);
				if (!matchesTitle && !matchesOrg && !matchesCat) return false;
			}
			return true;
		})
	);

	const paginatedEvents = $derived(
		filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);

	const totalPages = $derived(Math.ceil(filteredEvents.length / pageSize) || 1);

	const counts = $derived({
		pending: events.filter((e) => e.status === 'pending_approval').length,
		approved: events.filter((e) => e.status === 'approved').length,
		rejected: events.filter((e) => e.status === 'rejected').length
	});

	function formatIndonesianDate(iso: string) {
		if (!iso) return '-';
		const d = new Date(iso);
		return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	function formatTimeRange(startIso: string, endIso: string) {
		if (!startIso) return '-';
		const pad = (n: number) => n.toString().padStart(2, '0');
		const dStart = new Date(startIso);
		const startStr = `${pad(dStart.getHours())}.${pad(dStart.getMinutes())}`;
		if (!endIso) return `${startStr} WIB`;
		const dEnd = new Date(endIso);
		const endStr = `${pad(dEnd.getHours())}.${pad(dEnd.getMinutes())}`;
		return `${startStr} sd ${endStr} WIB`;
	}

	function openReviewModal(event: ManagedEvent) {
		reviewModalEvent = event;
		reviewReason = event.description || '';
		validationError = '';
	}

	function closeReviewModal() {
		reviewModalEvent = null;
		reviewReason = '';
		validationError = '';
	}

	async function handleReviewAction(mode: 'approve' | 'reject' | 'revision_requested') {
		if (!reviewModalEvent) return;
		validationError = '';

		if ((mode === 'reject' || mode === 'revision_requested') && !reviewReason.trim()) {
			validationError = `Alasan wajib diisi untuk melakukan ${mode === 'reject' ? 'penolakan' : 'permintaan revisi'}.`;
			return;
		}

		isSubmitting = true;
		feedback = null;
		try {
			const targetStatus: EventStatus =
				mode === 'approve' ? 'approved' : mode === 'reject' ? 'rejected' : 'revision_requested';
			await updateEventStatus(reviewModalEvent.id, targetStatus, reviewReason.trim() || undefined);

			if (mode === 'approve') {
				feedback = { type: 'success', message: `Acara "${reviewModalEvent.title}" berhasil disetujui.` };
			} else if (mode === 'revision_requested') {
				feedback = {
					type: 'success',
					message: `Permintaan revisi acara "${reviewModalEvent.title}" telah dikirim ke penyelenggara.`
				};
			} else {
				feedback = { type: 'success', message: `Acara "${reviewModalEvent.title}" telah ditolak.` };
			}

			closeReviewModal();
			await refreshList();
		} catch (err: any) {
			feedback = { type: 'error', message: err?.message || 'Aksi gagal diproses, silakan coba lagi.' };
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Validasi Acara - Super Admin | EventGate</title>
</svelte:head>

<div class="space-y-6">
	<!-- Alert Feedback -->
	{#if feedback}
		<div
			class="text-xs rounded-xl p-3 border flex items-center justify-between transition {feedback.type === 'success'
				? 'bg-emerald-50 text-emerald-800 border-emerald-200'
				: 'bg-red-50 text-red-700 border-red-200'}"
		>
			<div class="flex items-center gap-2">
				{#if feedback.type === 'success'}
					<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
				{:else}
					<AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
				{/if}
				<span>{feedback.message}</span>
			</div>
			<button onclick={() => (feedback = null)} class="text-slate-400 hover:text-slate-600 p-1">
				<X class="w-3.5 h-3.5" />
			</button>
		</div>
	{/if}

	<!-- Stat Cards (Dipertahankan sesuai instruksi QA) -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
			<div>
				<p class="text-xs text-slate-500 font-medium">Total Menunggu Approval</p>
				<p class="text-2xl font-bold text-amber-600 mt-1">{counts.pending}</p>
			</div>
			<div class="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
				<Calendar class="w-5 h-5" />
			</div>
		</div>
		<div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
			<div>
				<p class="text-xs text-slate-500 font-medium">Total Disetujui</p>
				<p class="text-2xl font-bold text-[#0B7A4B] mt-1">{counts.approved}</p>
			</div>
			<div class="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0B7A4B]">
				<CheckCircle2 class="w-5 h-5" />
			</div>
		</div>
		<div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
			<div>
				<p class="text-xs text-slate-500 font-medium">Total Ditolak</p>
				<p class="text-2xl font-bold text-red-600 mt-1">{counts.rejected}</p>
			</div>
			<div class="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
				<XCircle class="w-5 h-5" />
			</div>
		</div>
	</div>

	<!-- Title & Search/Filter Toolbar (Persis Desain Figma) -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<h2 class="text-base font-bold text-slate-900">Menunggu Validasi Acara</h2>

		<div class="flex items-center gap-3">
			<!-- Search Bar -->
			<div class="relative w-64">
				<Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari nama acara"
					class="w-full text-xs border border-slate-300 rounded-xl pl-9 pr-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7A4B] shadow-xs"
				/>
			</div>

			<!-- Status Filter -->
			<select
				bind:value={statusFilter}
				class="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B7A4B] shadow-xs"
			>
				<option value="all">Semua Status</option>
				<option value="pending_approval">Menunggu</option>
				<option value="approved">Disetujui</option>
				<option value="revision_requested">Revisi</option>
				<option value="rejected">Ditolak</option>
			</select>
		</div>
	</div>

	<!-- Table Content Section: Loading, Error, Empty, or Table -->
	{#if isLoading}
		<div class="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
			<Loader2 class="w-8 h-8 text-[#0B7A4B] animate-spin mx-auto mb-3" />
			<p class="text-xs font-semibold text-slate-700">Memuat Data Validasi Acara...</p>
		</div>
	{:else if hasError}
		<div class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-700 shadow-sm">
			<AlertCircle class="w-10 h-10 mx-auto mb-2 text-red-500" />
			<h3 class="text-sm font-bold">Gagal Memuat Data</h3>
			<p class="text-xs mt-1 text-red-600 max-w-md mx-auto">{errorMsg}</p>
			<button
				onclick={refreshList}
				class="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition shadow-sm"
			>
				<RefreshCw class="w-3.5 h-3.5" /> Coba Lagi
			</button>
		</div>
	{:else if filteredEvents.length === 0}
		<div class="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
			<FolderOpen class="w-12 h-12 text-slate-300 mx-auto mb-3" />
			<h3 class="text-sm font-bold text-slate-800">Tidak Ada Acara yang Perlu Divalidasi</h3>
			<p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
				{searchQuery || statusFilter !== 'all'
					? 'Tidak ada acara yang cocok dengan pencarian / filter.'
					: 'Semua acara telah divalidasi atau belum ada pengajuan baru.'}
			</p>
		</div>
	{:else}
		<!-- Table Container Sesuai Figma (Header Hijau Pekat, Row Border, Action Review) -->
		<div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-xs">
					<thead class="bg-[#0B7A4B] text-white text-xs font-bold">
						<tr>
							<th class="text-left px-5 py-3.5 font-bold">Nama Acara</th>
							<th class="text-left px-5 py-3.5 font-bold">Penyelenggara</th>
							<th class="text-center px-5 py-3.5 font-bold">Kategori</th>
							<th class="text-left px-5 py-3.5 font-bold">Tanggal, Waktu Acara</th>
							<th class="text-center px-5 py-3.5 font-bold">Aksi</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each paginatedEvents as event (event.id)}
							<tr class="hover:bg-slate-50/80 transition">
								<!-- Nama Acara & Poster -->
								<td class="px-5 py-3.5 max-w-xs">
									<div class="flex items-center gap-3">
										{#if event.banner_url}
											<img
												src={event.banner_url}
												alt={event.title}
												class="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
											/>
										{:else}
											<div class="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0B7A4B] shrink-0 font-bold text-xs">
												EG
											</div>
										{/if}
										<div class="min-w-0">
											<h4 class="font-bold text-slate-900 text-sm line-clamp-1">{event.title}</h4>
										</div>
									</div>
								</td>

								<!-- Penyelenggara -->
								<td class="px-5 py-3.5 text-slate-700 font-medium">
									{event.organizer_name}
								</td>

								<!-- Kategori (Pill dengan Bullet: • Seni, • Kompetisi, • Seminar) -->
								<td class="px-5 py-3.5 text-center">
									<span class="inline-block bg-[#F3F4F6] text-[#374151] px-3 py-1 rounded-full text-xs font-medium">
										• {event.category}
									</span>
								</td>

								<!-- Tanggal & Waktu Acara -->
								<td class="px-5 py-3.5 text-slate-800">
									<div class="font-bold text-slate-900 text-xs">
										{formatIndonesianDate(event.start_date)}
									</div>
									<div class="text-[11px] text-slate-500 mt-0.5">
										{formatTimeRange(event.start_date, event.end_date)}
									</div>
								</td>

								<!-- Aksi: Button "Review" Berbingkai Hijau Sesuai Figma -->
								<td class="px-5 py-3.5 text-center">
									<button
										onclick={() => openReviewModal(event)}
										class="border border-[#0B7A4B] text-[#0B7A4B] hover:bg-[#0B7A4B]/10 px-4 py-1 rounded-lg text-xs font-semibold transition"
									>
										Review
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Table Footer: Info Jumlah & Pagination (Sesuai Figma) -->
			<div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-500">
				<div>
					Menampilkan {filteredEvents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(
						currentPage * pageSize,
						filteredEvents.length
					)} dari {filteredEvents.length} Acara
				</div>
				{#if totalPages > 1}
					<div class="flex items-center gap-1.5 font-medium">
						<button
							disabled={currentPage === 1}
							onclick={() => currentPage--}
							class="p-1 rounded-md hover:bg-slate-200 text-slate-600 disabled:opacity-40 transition"
							title="Sebelumnya"
						>
							<ChevronLeft class="w-4 h-4" />
						</button>
						{#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNum}
							<button
								onclick={() => (currentPage = pageNum)}
								class="px-2.5 py-1 rounded-md text-xs transition {currentPage === pageNum
									? 'font-bold text-[#0B7A4B] bg-emerald-50 border border-emerald-200'
									: 'text-slate-600 hover:bg-slate-200'}"
							>
								{pageNum}
							</button>
						{/each}
						<button
							disabled={currentPage === totalPages}
							onclick={() => currentPage++}
							class="p-1 rounded-md hover:bg-slate-200 text-slate-600 disabled:opacity-40 transition"
							title="Berikutnya"
						>
							<ChevronRight class="w-4 h-4" />
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Review Modal (Frame "Review" di Figma: Masukkan Alasan + Reject, Revisi, Approve) -->
{#if reviewModalEvent}
	<div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
			<!-- Header Modal Review -->
			<div class="flex items-center justify-between border-b border-slate-100 pb-3">
				<div class="flex items-center gap-2">
					<h3 class="text-base font-bold text-slate-900">Review Acara</h3>
					<span class="text-xs font-semibold bg-[#F3F4F6] text-[#374151] px-2.5 py-0.5 rounded-full">
						• {reviewModalEvent.category}
					</span>
				</div>
				<button onclick={closeReviewModal} class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Info Singkat Acara yang di-review -->
			<div class="flex items-start gap-3.5 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
				{#if reviewModalEvent.banner_url}
					<img
						src={reviewModalEvent.banner_url}
						alt={reviewModalEvent.title}
						class="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
					/>
				{:else}
					<div class="w-14 h-14 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0B7A4B] shrink-0 font-bold text-sm">
						EG
					</div>
				{/if}
				<div class="space-y-0.5 min-w-0">
					<h4 class="font-bold text-slate-900 text-sm line-clamp-1">{reviewModalEvent.title}</h4>
					<p class="text-xs text-slate-500 font-medium">
						Penyelenggara: <span class="text-slate-700 font-semibold">{reviewModalEvent.organizer_name}</span>
					</p>
					<p class="text-[11px] text-slate-500">
						{formatIndonesianDate(reviewModalEvent.start_date)} • {formatTimeRange(
							reviewModalEvent.start_date,
							reviewModalEvent.end_date
						)}
					</p>
				</div>
			</div>

			<!-- Card "Masukkan Alasan" Sesuai Frame Figma -->
			<div class="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
				<label for="review-reason" class="block text-xs font-bold text-slate-900">
					Masukkan Alasan
				</label>
				<textarea
					id="review-reason"
					bind:value={reviewReason}
					rows="4"
					placeholder="Tuliskan catatan review, alasan revisi, atau alasan penolakan event..."
					class="w-full text-xs text-slate-700 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
				></textarea>
				{#if validationError}
					<p class="text-[11px] text-red-600 font-medium">{validationError}</p>
				{/if}
			</div>

			<!-- 3 Tombol Aksi: Reject, Revisi, Approve (Persis Desain Figma) -->
			<div class="flex items-center justify-end gap-3 pt-2">
				<button
					type="button"
					onclick={() => handleReviewAction('reject')}
					disabled={isSubmitting}
					class="text-xs font-semibold bg-[#FEE2E2] text-[#DC2626] hover:bg-red-200 px-6 py-2.5 rounded-xl transition disabled:opacity-60"
				>
					Reject
				</button>
				<button
					type="button"
					onclick={() => handleReviewAction('revision_requested')}
					disabled={isSubmitting}
					class="text-xs font-semibold bg-[#FEF3C7] text-[#D97706] hover:bg-amber-200 px-6 py-2.5 rounded-xl transition disabled:opacity-60"
				>
					Revisi
				</button>
				<button
					type="button"
					onclick={() => handleReviewAction('approve')}
					disabled={isSubmitting}
					class="text-xs font-semibold bg-[#0B7A4B] text-white hover:bg-[#09633d] px-6 py-2.5 rounded-xl transition shadow-xs disabled:opacity-60"
				>
					Approve
				</button>
			</div>
		</div>
	</div>
{/if}
