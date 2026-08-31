<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authStore, type AuthState } from '$lib/stores/authStore';
	import { getEventById, updateEventStatus, getApprovalLogs, type ManagedEvent } from '$lib/services/eventApi';
	import ConfirmActionModal from '$lib/components/common/ConfirmActionModal.svelte';
	import { ArrowLeft, Calendar, MapPin, Image as ImageIcon, CheckCircle2, AlertCircle, X, Check } from 'lucide-svelte';

	let currentAuth = $state<AuthState>({ isAuthenticated: false, user: null, token: null });
	authStore.subscribe((state) => (currentAuth = state));

	const eventId = $derived(Number(page.params.id));

	let event = $state<ManagedEvent | null>(null);
	let isLoading = $state(true);
	let feedback = $state<{ type: 'success' | 'error'; message: string } | null>(null);
	let modalMode = $state<'approve' | 'reject' | null>(null);
	let isSubmitting = $state(false);

	onMount(() => {
		if (currentAuth.user?.role !== 'super-admin') {
			goto(`/dashboard/${currentAuth.user?.role ?? 'auth/login'}`);
		} else {
			loadEvent();
		}
	});

	async function loadEvent() {
		isLoading = true;
		try {
			event = await getEventById(eventId);
			// Backend menyimpan alasan reject di approval log, bukan di objek event.
			if (event && event.status === 'rejected' && !event.reject_reason) {
				const logs = await getApprovalLogs(eventId);
				const lastReject = [...logs].reverse().find((l) => l.action === 'rejected');
				if (lastReject?.notes) event.reject_reason = lastReject.notes;
			}
		} catch {
			event = null;
		}
		isLoading = false;
	}

	const statusLabel: Record<string, string> = {
		draft: 'Draft',
		pending_approval: 'Menunggu Approval',
		approved: 'Disetujui',
		published: 'Dipublikasikan',
		rejected: 'Ditolak',
		revision_requested: 'Perlu Revisi',
		ended: 'Selesai'
	};

	const statusClass: Record<string, string> = {
		draft: 'bg-slate-100 text-slate-600 border-slate-200',
		pending_approval: 'bg-amber-50 text-amber-700 border-amber-200',
		approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
		published: 'bg-blue-50 text-blue-700 border-blue-200',
		rejected: 'bg-red-50 text-red-700 border-red-200',
		revision_requested: 'bg-orange-50 text-orange-700 border-orange-200',
		ended: 'bg-slate-100 text-slate-500 border-slate-200'
	};

	function formatDateTime(iso: string) {
		if (!iso) return '-';
		return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
	}

	function formatRupiah(amount: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
			amount
		);
	}

	async function handleConfirm(reason?: string) {
		if (!event) return;
		isSubmitting = true;
		feedback = null;
		try {
			if (modalMode === 'approve') {
				await updateEventStatus(event.id, 'approved');
				feedback = { type: 'success', message: 'Event berhasil disetujui.' };
			} else if (modalMode === 'reject') {
				await updateEventStatus(event.id, 'rejected', reason);
				feedback = { type: 'success', message: 'Event berhasil ditolak.' };
			}
			await loadEvent();
			modalMode = null;
		} catch (err: any) {
			feedback = { type: 'error', message: err?.message || 'Aksi gagal diproses, coba lagi.' };
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Detail Review Event #{eventId} - Super Admin | EventGate</title>
</svelte:head>

<div class="space-y-6 max-w-4xl">
	<button
		onclick={() => goto('/dashboard/super-admin/event-validation')}
		class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs transition"
	>
		<ArrowLeft class="w-4 h-4" /> Kembali ke Validasi Acara
	</button>

	{#if feedback}
		<div
			class="text-xs rounded-xl p-3 border flex items-center justify-between {feedback.type === 'success'
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

	{#if isLoading}
		<div class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
			<p class="text-xs text-slate-400">Memuat detail acara...</p>
		</div>
	{:else if !event}
		<div class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
			<p class="text-xs text-slate-400">Acara tidak ditemukan.</p>
		</div>
	{:else}
		<div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div>
				<div class="flex items-center gap-2.5 flex-wrap">
					<h1 class="text-xl font-bold text-slate-900">{event.title}</h1>
					<span class="border rounded-full px-2.5 py-0.5 text-xs font-semibold {statusClass[event.status]}">
						{statusLabel[event.status] ?? event.status}
					</span>
				</div>
				<p class="text-xs text-slate-500 mt-1 font-medium">Diajukan oleh: <span class="text-slate-700 font-semibold">{event.organizer_name}</span></p>
			</div>

			{#if event.status === 'pending_approval'}
				<div class="flex items-center gap-2 shrink-0">
					<button
						onclick={() => (modalMode = 'approve')}
						class="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
					>
						<Check class="w-4 h-4" />
						<span>Setujui Event</span>
					</button>
					<button
						onclick={() => (modalMode = 'reject')}
						class="inline-flex items-center gap-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg transition"
					>
						<X class="w-4 h-4" />
						<span>Tolak Event</span>
					</button>
				</div>
			{/if}
		</div>

		{#if event.status === 'rejected' && event.reject_reason}
			<div class="text-xs rounded-xl p-4 border bg-red-50 text-red-700 border-red-200 shadow-xs space-y-1">
				<p class="font-bold flex items-center gap-1.5 text-red-800">
					<AlertCircle class="w-4 h-4" /> Alasan Penolakan:
				</p>
				<p class="text-slate-700 pl-5">{event.reject_reason}</p>
			</div>
		{/if}

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<!-- Detail Acara -->
			<div class="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5 shadow-sm">
				<div class="flex items-center justify-between border-b border-slate-100 pb-2">
					<h2 class="text-sm font-bold text-slate-900">Detail Acara</h2>
					<span class="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">Kategori: {event.category}</span>
				</div>
				<p class="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{event.description}</p>
			</div>

			<!-- Tempat & Waktu -->
			<div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
				<h2 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Tempat & Waktu</h2>
				<div class="flex items-start gap-2.5 text-xs text-slate-700">
					<Calendar class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
					<div>
						<p class="font-semibold text-slate-800">{formatDateTime(event.start_date)}</p>
						<p class="text-slate-500 text-[11px]">sampai {formatDateTime(event.end_date)}</p>
					</div>
				</div>
				<div class="flex items-start gap-2.5 text-xs text-slate-700">
					<MapPin class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
					<div>
						<p class="font-semibold text-slate-800">{event.location}</p>
					</div>
				</div>
			</div>

			<!-- Tipe Tiket & Kuota -->
			<div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
				<h2 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Tipe Tiket & Kuota</h2>
				<table class="w-full text-xs">
					<thead class="text-slate-500 uppercase text-[10px]">
						<tr>
							<th class="text-left font-semibold pb-1.5">Tipe Tiket</th>
							<th class="text-left font-semibold pb-1.5">Harga</th>
							<th class="text-left font-semibold pb-1.5">Kuota</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						<tr>
							<td class="py-2 text-slate-700 capitalize font-medium">{event.ticket_type}</td>
							<td class="py-2 text-slate-900 font-bold">
								{event.ticket_type === 'gratis' || event.price === 0 ? 'Gratis' : formatRupiah(event.price)}
							</td>
							<td class="py-2 text-slate-700">{event.quota} Peserta</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Media & Banner -->
			<div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
				<h2 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Media Banner</h2>
				<div class="aspect-video rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
					{#if event.banner_url}
						<img src={event.banner_url} alt="Banner event" class="w-full h-full object-cover" />
					{:else}
						<div class="flex flex-col items-center gap-1 text-slate-400">
							<ImageIcon class="w-8 h-8" />
							<span class="text-[11px]">Tidak ada banner</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Modal Konfirmasi Setujui / Tolak -->
<ConfirmActionModal
	open={modalMode !== null}
	title={modalMode === 'approve' ? 'Setujui Pengajuan Event?' : 'Tolak Pengajuan Event'}
	description={event ? `Event "${event.title}" oleh ${event.organizer_name}.` : ''}
	requireReason={modalMode === 'reject'}
	reasonLabel="Alasan Penolakan (wajib)"
	confirmLabel={modalMode === 'approve' ? 'Ya, Setujui' : 'Kirim Penolakan'}
	confirmClass={modalMode === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
	{isSubmitting}
	onConfirm={handleConfirm}
	onCancel={() => (modalMode = null)}
/>
