<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, type AuthState } from '$lib/stores/authStore';
	import { listEvents, approveEvent, rejectEvent, type ApprovalEvent } from '$lib/services/approvalApi';
	import ConfirmActionModal from '$lib/components/common/ConfirmActionModal.svelte';
	import { Eye, CheckCircle2, XCircle, Loader2 } from 'lucide-svelte';

	let currentAuth = $state<AuthState>({ isAuthenticated: false, user: null, token: null });
	authStore.subscribe((state) => (currentAuth = state));

	onMount(() => {
		if (currentAuth.user?.role !== 'super-admin') {
			goto(`/dashboard/${currentAuth.user?.role ?? 'super-admin'}`);
		} else {
			refreshList();
		}
	});

	let events = $state<ApprovalEvent[]>([]);
	let isLoading = $state(true);
	let feedback = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	let organizerFilter = $state('all');
	let statusFilter = $state<'all' | 'pending_approval' | 'approved' | 'rejected'>('all');

	let modalMode = $state<'approve' | 'reject' | null>(null);
	let modalEvent = $state<ApprovalEvent | null>(null);
	let isSubmitting = $state(false);

	async function refreshList() {
		isLoading = true;
		events = await listEvents();
		isLoading = false;
	}

	const organizers = $derived([...new Set(events.map((e) => e.organizer_name))]);

	const filteredEvents = $derived(
		events.filter((e) => {
			if (organizerFilter !== 'all' && e.organizer_name !== organizerFilter) return false;
			if (statusFilter !== 'all' && e.status !== statusFilter) return false;
			return true;
		})
	);

	const counts = $derived({
		pending: events.filter((e) => e.status === 'pending_approval').length,
		approved: events.filter((e) => e.status === 'approved').length,
		rejected: events.filter((e) => e.status === 'rejected').length
	});

	const statusLabel: Record<ApprovalEvent['status'], string> = {
		pending_approval: 'Menunggu',
		approved: 'Disetujui',
		rejected: 'Ditolak'
	};
	const statusClass: Record<ApprovalEvent['status'], string> = {
		pending_approval: 'bg-amber-50 text-amber-700 border-amber-200',
		approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
		rejected: 'bg-red-50 text-red-700 border-red-200'
	};

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	function openApprove(event: ApprovalEvent) {
		modalMode = 'approve';
		modalEvent = event;
	}
	function openReject(event: ApprovalEvent) {
		modalMode = 'reject';
		modalEvent = event;
	}
	function closeModal() {
		modalMode = null;
		modalEvent = null;
	}

	async function handleConfirm(reason?: string) {
		if (!modalEvent) return;
		isSubmitting = true;
		feedback = null;
		try {
			if (modalMode === 'approve') {
				await approveEvent(modalEvent.event_id);
				feedback = { type: 'success', message: `Event "${modalEvent.title}" berhasil disetujui.` };
			} else if (modalMode === 'reject') {
				await rejectEvent(modalEvent.event_id, reason ?? '');
				feedback = { type: 'success', message: `Event "${modalEvent.title}" ditolak.` };
			}
			await refreshList();
			closeModal();
		} catch {
			feedback = { type: 'error', message: 'Aksi gagal diproses, coba lagi.' };
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
		<h1 class="text-xl font-bold text-slate-900">Event Validation</h1>
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

	<!-- Stat cards -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="bg-white border border-slate-200 rounded-xl p-4">
			<p class="text-xs text-slate-500">Total Pending</p>
			<p class="text-2xl font-bold text-slate-900">{counts.pending}</p>
		</div>
		<div class="bg-white border border-slate-200 rounded-xl p-4">
			<p class="text-xs text-slate-500">Total di Setujui</p>
			<p class="text-2xl font-bold text-slate-900">{counts.approved}</p>
		</div>
		<div class="bg-white border border-slate-200 rounded-xl p-4">
			<p class="text-xs text-slate-500">Total di Tolak</p>
			<p class="text-2xl font-bold text-slate-900">{counts.rejected}</p>
		</div>
	</div>

	<!-- Filter toolbar -->
	<div class="flex flex-wrap gap-3">
		<select
			bind:value={organizerFilter}
			class="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
		>
			<option value="all">Semua Organizer</option>
			{#each organizers as organizer}
				<option value={organizer}>{organizer}</option>
			{/each}
		</select>
		<select
			bind:value={statusFilter}
			class="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
		>
			<option value="all">Semua Status</option>
			<option value="pending_approval">Menunggu</option>
			<option value="approved">Disetujui</option>
			<option value="rejected">Ditolak</option>
		</select>
	</div>

	<!-- Table -->
	<div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
		{#if isLoading}
			<div class="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
				<Loader2 class="w-4 h-4 animate-spin" /> Memuat data...
			</div>
		{:else if filteredEvents.length === 0}
			<div class="p-6 text-center text-xs text-slate-400">Tidak ada event yang cocok dengan filter.</div>
		{:else}
			<table class="w-full text-xs">
				<thead class="bg-slate-50 text-slate-500 uppercase text-[11px]">
					<tr>
						<th class="text-left px-4 py-2.5 font-semibold">Nama Event</th>
						<th class="text-left px-4 py-2.5 font-semibold">Penyelenggara</th>
						<th class="text-left px-4 py-2.5 font-semibold">Tanggal Pengajuan</th>
						<th class="text-left px-4 py-2.5 font-semibold">Status</th>
						<th class="text-left px-4 py-2.5 font-semibold">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredEvents as event (event.event_id)}
						<tr class="hover:bg-slate-50">
							<td class="px-4 py-3 font-semibold text-slate-900">{event.title}</td>
							<td class="px-4 py-3 text-slate-600">{event.organizer_name}</td>
							<td class="px-4 py-3 text-slate-600">{formatDate(event.submitted_at)}</td>
							<td class="px-4 py-3">
								<span class="border rounded-full px-2 py-0.5 text-[11px] font-semibold {statusClass[event.status]}">
									{statusLabel[event.status]}
								</span>
							</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-2">
									<button
										onclick={() => goto(`/dashboard/super-admin/event-validation/${event.event_id}`)}
										title="Lihat detail"
										class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
									>
										<Eye class="w-4 h-4" />
									</button>
									{#if event.status === 'pending_approval'}
										<button
											onclick={() => openApprove(event)}
											title="Approve"
											class="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700"
										>
											<CheckCircle2 class="w-4 h-4" />
										</button>
										<button
											onclick={() => openReject(event)}
											title="Reject"
											class="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
										>
											<XCircle class="w-4 h-4" />
										</button>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<ConfirmActionModal
	open={modalMode !== null}
	title={modalMode === 'approve' ? 'Setujui Event?' : 'Tolak Event'}
	description={modalEvent
		? `Event "${modalEvent.title}" oleh ${modalEvent.organizer_name}.`
		: ''}
	requireReason={modalMode === 'reject'}
	reasonLabel="Alasan Penolakan (wajib)"
	confirmLabel={modalMode === 'approve' ? 'Ya, Setujui' : 'Kirim Penolakan'}
	confirmClass={modalMode === 'approve' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-red-600 hover:bg-red-700'}
	{isSubmitting}
	onConfirm={handleConfirm}
	onCancel={closeModal}
/>
