<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import EventForm from '$lib/components/events/EventForm.svelte';
	import { getEventById, updateEvent, type ManagedEvent, type EventFormData } from '$lib/services/eventApi';
	import { Loader2, AlertCircle } from 'lucide-svelte';

	let eventId = $derived(Number($page.params.id));
	let initialData = $state<ManagedEvent | null>(null);
	let isLoading = $state(true);
	let isSubmitting = $state(false);
	let fetchError = $state<string | null>(null);
	let submitError = $state<string | null>(null);

	onMount(() => {
		loadEvent();
	});

	async function loadEvent() {
		isLoading = true;
		fetchError = null;
		try {
			const data = await getEventById(eventId);
			initialData = data;
		} catch (err: any) {
			fetchError = err?.message || 'Event tidak ditemukan atau gagal dimuat.';
		} finally {
			isLoading = false;
		}
	}

	async function handleSubmit(formData: EventFormData) {
		isSubmitting = true;
		submitError = null;
		try {
			await updateEvent(eventId, formData);
			goto('/dashboard/super-admin/event-management');
		} catch (err: any) {
			submitError = err?.message || 'Gagal menyimpan perubahan event. Silakan coba lagi.';
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		goto('/dashboard/super-admin/event-management');
	}
</script>

<svelte:head>
	<title>Edit Event #{eventId} - Super Admin | EventGate</title>
</svelte:head>

<div class="space-y-6">
	{#if isLoading}
		<div class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm max-w-4xl">
			<Loader2 class="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
			<p class="text-xs font-semibold text-slate-700">Memuat Data Event...</p>
		</div>
	{:else if fetchError || !initialData}
		<div class="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700 shadow-sm max-w-4xl">
			<AlertCircle class="w-10 h-10 mx-auto mb-2 text-red-500" />
			<h3 class="text-sm font-bold">Event Tidak Ditemukan</h3>
			<p class="text-xs mt-1 text-red-600">{fetchError}</p>
			<button
				onclick={handleCancel}
				class="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 px-4 py-2 rounded-lg transition"
			>
				Kembali ke Event Management
			</button>
		</div>
	{:else}
		<EventForm
			{initialData}
			isEdit={true}
			{isSubmitting}
			errorMessage={submitError}
			onSubmit={handleSubmit}
			onCancel={handleCancel}
		/>
	{/if}
</div>
