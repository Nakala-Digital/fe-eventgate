<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, type AuthState } from '$lib/stores/authStore';
	import {
		listPendingEvents,
		getEventDetail,
		approveEvent,
		rejectEvent,
		type PendingEvent
	} from '$lib/services/approvalApi';
	import { Calendar, MapPin, User, CheckCircle2, XCircle, Loader2 } from 'lucide-svelte';

	let currentAuth = $state<AuthState>({ isAuthenticated: false, user: null, token: null });
	authStore.subscribe((state) => (currentAuth = state));

	onMount(() => {
		if (currentAuth.user?.role !== 'super-admin') {
			goto(`/dashboard/${currentAuth.user?.role ?? 'super-admin'}`);
		} else {
			refreshList();
		}
	});

	let pendingEvents = $state<PendingEvent[]>([]);
	let selectedId = $state<number | null>(null);
	let selected = $state<PendingEvent | undefined>(undefined);
	let isLoadingList = $state(true);
	let isSubmitting = $state(false);
	let showRejectForm = $state(false);
	let rejectReason = $state('');
	let feedback = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	async function refreshList() {
		isLoadingList = true;
		pendingEvents = await listPendingEvents();
		isLoadingList = false;
		if (pendingEvents.length > 0) {
			selectEvent(pendingEvents[0].event_id);
		} else {
			selectedId = null;
			selected = undefined;
		}
	}

	async function selectEvent(id: number) {
		selectedId = id;
		showRejectForm = false;
		rejectReason = '';
		selected = await getEventDetail(id);
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString('id-ID', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}

	async function handleApprove() {
		if (!selected) return;
		isSubmitting = true;
		feedback = null;
		try {
			await approveEvent(selected.event_id);
			feedback = { type: 'success', message: `Event "${selected.title}" berhasil disetujui.` };
			await refreshList();
		} catch {
			feedback = { type: 'error', message: 'Gagal menyetujui event, coba lagi.' };
		} finally {
			isSubmitting = false;
		}
	}

	async function handleReject() {
		if (!selected) return;
		if (!rejectReason.trim()) {
			feedback = { type: 'error', message: 'Alasan penolakan wajib diisi.' };
			return;
		}
		isSubmitting = true;
		feedback = null;
		try {
			await rejectEvent(selected.event_id, rejectReason.trim());
			feedback = { type: 'success', message: `Event "${selected.title}" ditolak.` };
			await refreshList();
		} catch {
			feedback = { type: 'error', message: 'Gagal menolak event, coba lagi.' };
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Event Validation - Super Admin | EventGate</title>
</svelte:head>

<div class="space-y-6">
	<div class="border-b border-slate-200 pb-4">
		<h1 class="text-xl font-bold text-slate-900">Validasi Event</h1>
		<p class="text-xs text-slate-500">Review, setujui, atau tolak event yang diajukan Admin Panitia.</p>
	</div>

	{#if feedback}
		<div
			class="text-xs rounded-lg px-3 py-2 border {feedback.type === 'success'
				? 'bg-emerald-50 text-emerald-800 border-emerald-200'
				: 'bg-red-50 text-red-700 border-red-200'}"
		>
			{feedback.message}
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
		<!-- List pending approval -->
		<div class="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
			<div class="px-4 py-3 border-b border-slate-100 text-xs font-semibold text-slate-600 uppercase">
				Menunggu Approval ({pendingEvents.length})
			</div>
			{#if isLoadingList}
				<div class="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
					<Loader2 class="w-4 h-4 animate-spin" /> Memuat data...
				</div>
			{:else if pendingEvents.length === 0}
				<div class="p-6 text-center text-xs text-slate-400">Tidak ada event yang menunggu approval.</div>
			{:else}
				<ul class="divide-y divide-slate-100">
					{#each pendingEvents as event (event.event_id)}
						<li>
							<button
								onclick={() => selectEvent(event.event_id)}
								class="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors {selectedId === event.event_id ? 'bg-emerald-50' : ''}"
							>
								<p class="text-sm font-semibold text-slate-900">{event.title}</p>
								<p class="text-[11px] text-slate-500">{event.organizer_name} · Diajukan {formatDate(event.submitted_at)}</p>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Detail review -->
		<div class="lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
			{#if !selected}
				<p class="text-xs text-slate-400">Pilih event di daftar untuk melihat detail review.</p>
			{:else}
				<div class="space-y-4">
					<div>
						<h2 class="text-lg font-bold text-slate-900">{selected.title}</h2>
						<p class="text-xs text-slate-500 flex items-center gap-1 mt-1">
							<User class="w-3.5 h-3.5" /> {selected.organizer_name}
						</p>
					</div>

					<p class="text-sm text-slate-700">{selected.description}</p>

					<div class="grid grid-cols-2 gap-3 text-xs">
						<div class="flex items-center gap-2 text-slate-600">
							<Calendar class="w-4 h-4 text-emerald-700" />
							{formatDate(selected.start_date)} — {formatDate(selected.end_date)}
						</div>
						<div class="flex items-center gap-2 text-slate-600">
							<MapPin class="w-4 h-4 text-emerald-700" />
							{selected.location}
						</div>
						<div class="text-slate-600">
							<span class="font-semibold">Status Tiket:</span>
							{selected.is_paid ? `Berbayar (Rp${selected.price.toLocaleString('id-ID')})` : 'Gratis'}
						</div>
						<div class="text-slate-600">
							<span class="font-semibold">Kuota:</span> {selected.quota} peserta
						</div>
					</div>

					{#if showRejectForm}
						<div class="space-y-2 border border-red-200 bg-red-50 rounded-lg p-3">
							<label for="reject-reason" class="text-[11px] font-bold text-red-700 uppercase">Alasan Penolakan (wajib)</label>
							<textarea
								id="reject-reason"
								bind:value={rejectReason}
								rows="3"
								placeholder="Jelaskan alasan event ini ditolak..."
								class="w-full text-xs border border-red-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
							></textarea>
							<div class="flex gap-2 justify-end">
								<button
									onclick={() => (showRejectForm = false)}
									class="text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100"
								>
									Batal
								</button>
								<button
									onclick={handleReject}
									disabled={isSubmitting}
									class="text-xs font-bold bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg"
								>
									Kirim Penolakan
								</button>
							</div>
						</div>
					{:else}
						<div class="flex gap-3 pt-2">
							<button
								onclick={handleApprove}
								disabled={isSubmitting}
								class="flex items-center gap-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white px-4 py-2 rounded-lg shadow"
							>
								<CheckCircle2 class="w-4 h-4" /> Approve
							</button>
							<button
								onclick={() => (showRejectForm = true)}
								disabled={isSubmitting}
								class="flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-red-50 disabled:opacity-60 text-red-700 border border-red-300 px-4 py-2 rounded-lg"
							>
								<XCircle class="w-4 h-4" /> Reject
							</button>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
