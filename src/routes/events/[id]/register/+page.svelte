<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { getEventById, type ManagedEvent } from '$lib/services/eventApi';
	import { listQuestions, type DynamicQuestion } from '$lib/services/formApi';
	import { submitRegistration, type Registration, type RegistrationAnswer } from '$lib/services/registrationApi';
	import { ArrowLeft, Loader2, CheckCircle2, Clock } from 'lucide-svelte';

	const eventId = $derived(Number(page.params.id));

	let event = $state<ManagedEvent | null>(null);
	let questions = $state<DynamicQuestion[]>([]);
	let isLoading = $state(true);
	let notFound = $state(false);

	let participantName = $state('');
	let participantEmail = $state('');
	let answerValues = $state<Record<number, string>>({});
	let checkboxValues = $state<Record<number, string[]>>({});
	let errors = $state<Record<string, string>>({});
	let isSubmitting = $state(false);
	let submitError = $state('');
	let result = $state<Registration | null>(null);

	onMount(loadData);

	async function loadData() {
		isLoading = true;
		notFound = false;
		try {
			const data = await getEventById(eventId);
			if (data.status !== 'published') {
				notFound = true;
			} else {
				event = data;
				questions = await listQuestions(eventId);
				for (const q of questions) {
					if (q.type === 'checkbox') checkboxValues[q.id] = [];
				}
			}
		} catch {
			notFound = true;
		} finally {
			isLoading = false;
		}
	}

	function validate(): boolean {
		const newErrors: Record<string, string> = {};
		if (!participantName.trim()) newErrors.participantName = 'Nama wajib diisi.';
		if (!participantEmail.trim()) newErrors.participantEmail = 'Email wajib diisi.';

		for (const q of questions) {
			if (q.requirement !== 'wajib') continue;
			if (q.type === 'checkbox') {
				if (!checkboxValues[q.id]?.length) newErrors[`q_${q.id}`] = 'Wajib diisi.';
			} else if (!answerValues[q.id]?.trim()) {
				newErrors[`q_${q.id}`] = 'Wajib diisi.';
			}
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!event) return;
		if (!validate()) return;

		submitError = '';
		isSubmitting = true;
		try {
			const answers: RegistrationAnswer[] = questions.map((q) => ({
				question_id: q.id,
				label: q.label,
				value: q.type === 'checkbox' ? (checkboxValues[q.id] ?? []).join(', ') : (answerValues[q.id] ?? '')
			}));

			result = await submitRegistration(
				event.id,
				{ participant_name: participantName.trim(), participant_email: participantEmail.trim(), answers },
				event.ticket_type === 'berbayar'
			);
		} catch {
			submitError = 'Gagal mengirim pendaftaran, coba lagi.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Daftar Event - EventGate</title>
</svelte:head>

<div class="py-8 px-6 max-w-2xl mx-auto space-y-6 w-full">
	<a
		href={event ? `/events/${event.id}` : '/events'}
		class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
	>
		<ArrowLeft class="w-4 h-4" /> Kembali ke Detail Event
	</a>

	{#if isLoading}
		<div class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
			<Loader2 class="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
			<p class="text-xs font-semibold text-slate-700">Memuat formulir pendaftaran...</p>
		</div>
	{:else if notFound || !event}
		<div class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
			<p class="text-sm font-bold text-slate-800">Event tidak ditemukan</p>
		</div>
	{:else if result}
		<!-- Success / status state -->
		<div class="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm space-y-3">
			{#if result.status === 'confirmed'}
				<CheckCircle2 class="w-14 h-14 text-brand-600 mx-auto" />
				<h2 class="text-lg font-bold text-slate-900">Pendaftaran Berhasil!</h2>
				<p class="text-xs text-slate-500">Kamu terdaftar untuk "{event.title}". Sampai jumpa di acaranya!</p>
			{:else}
				<Clock class="w-14 h-14 text-amber-500 mx-auto" />
				<h2 class="text-lg font-bold text-slate-900">Menunggu Pembayaran</h2>
				<p class="text-xs text-slate-500">
					Pendaftaran untuk "{event.title}" tercatat. Selesaikan pembayaran untuk mengonfirmasi tiketmu.
				</p>
			{/if}
			<div class="inline-block bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
				<p class="text-[10px] text-slate-500 uppercase font-semibold">Kode Registrasi</p>
				<p class="text-sm font-bold text-slate-900 tracking-wider">{result.registration_code}</p>
			</div>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
			<div class="border-b border-slate-200 pb-4">
				<h1 class="text-lg font-bold text-slate-900">Form Pendaftaran</h1>
				<p class="text-xs text-slate-500">{event.title}</p>
			</div>

			{#if submitError}
				<p class="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{submitError}</p>
			{/if}

			<div class="space-y-1.5">
				<label for="participant-name" class="block text-xs font-medium text-slate-700">
					Nama Lengkap <span class="text-red-500">*</span>
				</label>
				<input
					id="participant-name"
					type="text"
					bind:value={participantName}
					class="w-full text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600 {errors.participantName ? 'border-red-500' : 'border-slate-300'}"
				/>
				{#if errors.participantName}<p class="text-[11px] text-red-500">{errors.participantName}</p>{/if}
			</div>

			<div class="space-y-1.5">
				<label for="participant-email" class="block text-xs font-medium text-slate-700">
					Email <span class="text-red-500">*</span>
				</label>
				<input
					id="participant-email"
					type="email"
					bind:value={participantEmail}
					class="w-full text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600 {errors.participantEmail ? 'border-red-500' : 'border-slate-300'}"
				/>
				{#if errors.participantEmail}<p class="text-[11px] text-red-500">{errors.participantEmail}</p>{/if}
			</div>

			{#each questions as q (q.id)}
				<div class="space-y-1.5">
					<label for={`q-${q.id}`} class="block text-xs font-medium text-slate-700">
						{q.label} {q.requirement === 'wajib' ? '' : '(Opsional)'}
						{#if q.requirement === 'wajib'}<span class="text-red-500">*</span>{/if}
					</label>

					{#if q.type === 'textarea'}
						<textarea
							id={`q-${q.id}`}
							bind:value={answerValues[q.id]}
							rows="3"
							class="w-full text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600 {errors[`q_${q.id}`] ? 'border-red-500' : 'border-slate-300'}"
						></textarea>
					{:else if q.type === 'select'}
						<select
							id={`q-${q.id}`}
							bind:value={answerValues[q.id]}
							class="w-full text-xs border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 {errors[`q_${q.id}`] ? 'border-red-500' : 'border-slate-300'}"
						>
							<option value="">Pilih {q.label}</option>
							{#each q.options as opt}
								<option value={opt.label}>{opt.label}</option>
							{/each}
						</select>
					{:else if q.type === 'radio'}
						<div class="space-y-1">
							{#each q.options as opt}
								<label class="flex items-center gap-1.5 text-xs text-slate-700">
									<input type="radio" name={`q-${q.id}`} value={opt.label} bind:group={answerValues[q.id]} />
									{opt.label}
								</label>
							{/each}
						</div>
					{:else if q.type === 'checkbox'}
						<div class="space-y-1">
							{#each q.options as opt}
								<label class="flex items-center gap-1.5 text-xs text-slate-700">
									<input type="checkbox" value={opt.label} bind:group={checkboxValues[q.id]} />
									{opt.label}
								</label>
							{/each}
						</div>
					{:else if q.type === 'file_upload'}
						<input id={`q-${q.id}`} type="file" class="w-full text-xs" />
					{:else}
						<input
							id={`q-${q.id}`}
							type={q.type === 'number' ? 'number' : q.type === 'date' ? 'date' : 'text'}
							bind:value={answerValues[q.id]}
							class="w-full text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600 {errors[`q_${q.id}`] ? 'border-red-500' : 'border-slate-300'}"
						/>
					{/if}
					{#if errors[`q_${q.id}`]}<p class="text-[11px] text-red-500">{errors[`q_${q.id}`]}</p>{/if}
				</div>
			{/each}

			{#if event.ticket_type === 'berbayar'}
				<div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
					Event ini berbayar. Setelah mendaftar, kamu perlu menyelesaikan pembayaran untuk mengonfirmasi tiket.
				</div>
			{/if}

			<button
				type="submit"
				disabled={isSubmitting}
				class="w-full text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 disabled:opacity-60 px-4 py-2.5 rounded-lg shadow-sm"
			>
				{isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
			</button>
		</form>
	{/if}
</div>
