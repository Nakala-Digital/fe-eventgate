<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authStore, type AuthState } from '$lib/stores/authStore';
	import { getEventDetail, approveEvent, rejectEvent, type ApprovalEvent } from '$lib/services/approvalApi';
	import ConfirmActionModal from '$lib/components/common/ConfirmActionModal.svelte';
	import { ArrowLeft, Calendar, MapPin, Image as ImageIcon } from 'lucide-svelte';

	let currentAuth = $state<AuthState>({ isAuthenticated: false, user: null, token: null });
	authStore.subscribe((state) => (currentAuth = state));

	const eventId = $derived(Number(page.params.id));

	let event = $state<ApprovalEvent | undefined>(undefined);
	let isLoading = $state(true);
	let feedback = $state<{ type: 'success' | 'error'; message: string } | null>(null);
	let modalMode = $state<'approve' | 'reject' | null>(null);
	let isSubmitting = $state(false);

	onMount(() => {
		if (currentAuth.user?.role !== 'super-admin') {
			goto(`/dashboard/${currentAuth.user?.role ?? 'super-admin'}`);
		} else {
			loadEvent();
		}
	});

	async function loadEvent() {
		isLoading = true;
		event = await getEventDetail(eventId);
		isLoading = false;
	}

	const statusLabel: Record<string, string> = {
		pending_approval: 'Menunggu',
		approved: 'Disetujui',
		rejected: 'Ditolak'
	};
	const statusClass: Record<string, string> = {
		pending_approval: 'bg-amber-50 text-amber-700 border-amber-200',
		approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
		rejected: 'bg-red-50 text-red-700 border-red-200'
	};

	function formatDateTime(iso: string) {
		return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
	}

	async function handleConfirm(reason?: string) {
		if (!event) return;
		isSubmitting = true;
		feedback = null;
		try {
			if (modalMode === 'approve') {
				await approveEvent(event.event_id);
				feedback = { type: 'success', message: 'Event berhasil disetujui.' };
			} else if (modalMode === 'reject') {
				await rejectEvent(event.event_id, reason ?? '');
				feedback = { type: 'success', message: 'Event ditolak.' };
			}
			await loadEvent();
			modalMode = null;
		} catch {
			feedback = { type: 'error', message: 'Aksi gagal diproses, coba lagi.' };
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Detail Review Event - Super Admin | EventGate</title>
</svelte:head>

<div class="space-y-6 max-w-4xl">
	<button
		onclick={() => goto('/dashboard/super-admin/event-validation')}
		class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
	>
		<ArrowLeft class="w-4 h-4" /> Kembali ke Event Validation
	</button>

	{#if feedback}
		<div
			class="text-xs rounded-lg px-3 py-2 border {feedback.type === 'success'
				? 'bg-emerald-50 text-emerald-800 border-emerald-200'
				: 'bg-red-50 text-red-700 border-red-200'}"
		>
			{feedback.message}
		</div>
	{/if}

	{#if isLoading}
		<p class="text-xs text-slate-400">Memuat detail event...</p>
	{:else if !event}
		<p class="text-xs text-slate-400">Event tidak ditemukan.</p>
	{:else}
		<div class="border-b border-slate-200 pb-4 flex items-start justify-between">
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-lg font-bold text-slate-900">{event.title}</h1>
					<span class="border rounded-full px-2 py-0.5 text-[11px] font-semibold {statusClass[event.status]}">
						{statusLabel[event.status]}
					</span>
				</div>
				<p class="text-xs text-slate-500 mt-1">{event.organizer_name}</p>
			</div>

			{#if event.status === 'pending_approval'}
				<div class="flex gap-2 shrink-0">
					<button
						onclick={() => (modalMode = 'approve')}
						class="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg shadow"
					>
						Approve
					</button>
					<button
						onclick={() => (modalMode = 'reject')}
						class="text-xs font-bold bg-white hover:bg-red-50 text-red-700 border border-red-300 px-4 py-2 rounded-lg"
					>
						Reject
					</button>
				</div>
			{/if}
		</div>

		{#if event.status === 'rejected' && event.reject_reason}
			<div class="text-xs rounded-lg px-3 py-2 border bg-red-50 text-red-700 border-red-200">
				<span class="font-semibold">Alasan penolakan:</span> {event.reject_reason}
			</div>
		{/if}

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
				<div class="flex items-center justify-between">
					<h2 class="text-sm font-bold text-slate-900">Detail Acara</h2>
					<span class="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Kategori: {event.category}</span>
				</div>
				<p class="text-xs text-slate-600">{event.description}</p>
			</div>

			<div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
				<h2 class="text-sm font-bold text-slate-900">Tempat & Waktu</h2>
				<div class="flex items-center gap-2 text-xs text-slate-600">
					<Calendar class="w-4 h-4 text-emerald-700" />
					{formatDateTime(event.start_date)} — {formatDateTime(event.end_date)}
				</div>
				<div class="flex items-center gap-2 text-xs text-slate-600">
					<MapPin class="w-4 h-4 text-emerald-700" />
					{event.location}
				</div>
			</div>

			<div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
				<h2 class="text-sm font-bold text-slate-900">Tipe Tiket</h2>
				<table class="w-full text-xs">
					<thead class="text-slate-500 uppercase text-[10px]">
						<tr>
							<th class="text-left font-semibold pb-1">Nama Tiket</th>
							<th class="text-left font-semibold pb-1">Harga (IDR)</th>
							<th class="text-left font-semibold pb-1">Kuota</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each event.ticket_types as ticket}
							<tr>
								<td class="py-1.5 text-slate-700">{ticket.name}</td>
								<td class="py-1.5 text-slate-700">{ticket.price === 0 ? 'Gratis' : ticket.price.toLocaleString('id-ID')}</td>
								<td class="py-1.5 text-slate-700">{ticket.quota}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
				<h2 class="text-sm font-bold text-slate-900">Media & Banner</h2>
				<div class="aspect-video rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
					{#if event.banner_url}
						<img src={event.banner_url} alt="Banner event" class="w-full h-full object-cover rounded-lg" />
					{:else}
						<ImageIcon class="w-8 h-8" />
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<ConfirmActionModal
	open={modalMode !== null}
	title={modalMode === 'approve' ? 'Setujui Event?' : 'Tolak Event'}
	description={event ? `Event "${event.title}" oleh ${event.organizer_name}.` : ''}
	requireReason={modalMode === 'reject'}
	reasonLabel="Alasan Penolakan (wajib)"
	confirmLabel={modalMode === 'approve' ? 'Ya, Setujui' : 'Kirim Penolakan'}
	confirmClass={modalMode === 'approve' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-red-600 hover:bg-red-700'}
	{isSubmitting}
	onConfirm={handleConfirm}
	onCancel={() => (modalMode = null)}
/>
