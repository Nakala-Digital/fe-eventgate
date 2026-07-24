<script lang="ts">
	import { goto } from '$app/navigation';
	import EventForm from '$lib/components/events/EventForm.svelte';
	import { createEvent, type EventFormData } from '$lib/services/eventApi';

	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);

	async function handleSubmit(formData: EventFormData) {
		isSubmitting = true;
		errorMessage = null;
		try {
			await createEvent(formData);
			goto('/dashboard/panitia/event-management');
		} catch (err: any) {
			errorMessage = err?.message || 'Gagal membuat event baru. Silakan coba lagi.';
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		goto('/dashboard/panitia/event-management');
	}
</script>

<svelte:head>
	<title>Buat Event Baru - Admin Panitia | EventGate</title>
</svelte:head>

<div class="space-y-6">
	<EventForm
		isEdit={false}
		{isSubmitting}
		{errorMessage}
		onSubmit={handleSubmit}
		onCancel={handleCancel}
	/>
</div>
