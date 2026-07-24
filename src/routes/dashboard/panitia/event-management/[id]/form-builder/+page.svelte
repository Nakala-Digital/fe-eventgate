<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authStore, type AuthState } from '$lib/stores/authStore';
	import { getEventById, type ManagedEvent } from '$lib/services/eventApi';
	import {
		listQuestions,
		createQuestion,
		updateQuestion,
		deleteQuestion,
		reorderQuestion,
		type DynamicQuestion,
		type QuestionFormData,
		type QuestionType,
		type QuestionRequirement
	} from '$lib/services/formApi';
	import ConfirmActionModal from '$lib/components/common/ConfirmActionModal.svelte';
	import {
		ArrowLeft,
		Plus,
		Pencil,
		Trash2,
		ArrowUp,
		ArrowDown,
		Loader2,
		Eye
	} from 'lucide-svelte';

	let currentAuth = $state<AuthState>({ isAuthenticated: false, user: null, token: null });
	authStore.subscribe((state) => (currentAuth = state));

	const eventId = $derived(Number(page.params.id));

	let event = $state<ManagedEvent | null>(null);
	let questions = $state<DynamicQuestion[]>([]);
	let isLoading = $state(true);
	let feedback = $state<{ type: 'success' | 'error'; message: string } | null>(null);
	let deleteTarget = $state<DynamicQuestion | null>(null);
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
		try {
			[event, questions] = await Promise.all([getEventById(eventId), listQuestions(eventId)]);
		} catch {
			event = null;
		} finally {
			isLoading = false;
		}
	}

	// --- Add/Edit question form ---
	const typeLabels: Record<QuestionType, string> = {
		text: 'Teks Singkat',
		textarea: 'Teks Panjang',
		number: 'Angka',
		date: 'Tanggal',
		select: 'Dropdown',
		radio: 'Pilihan Ganda (Radio)',
		checkbox: 'Kotak Centang (Checkbox)',
		file_upload: 'Unggah File'
	};
	const optionTypes: QuestionType[] = ['select', 'radio', 'checkbox'];

	let showForm = $state(false);
	let editingId = $state<number | null>(null);
	let formLabel = $state('');
	let formType = $state<QuestionType>('text');
	let formRequirement = $state<QuestionRequirement>('wajib');
	let formOptions = $state<string[]>(['']);
	let formError = $state('');
	let isSubmitting = $state(false);

	function openAddForm() {
		editingId = null;
		formLabel = '';
		formType = 'text';
		formRequirement = 'wajib';
		formOptions = [''];
		formError = '';
		showForm = true;
	}

	function openEditForm(q: DynamicQuestion) {
		editingId = q.id;
		formLabel = q.label;
		formType = q.type;
		formRequirement = q.requirement;
		formOptions = q.options.length > 0 ? q.options.map((o) => o.label) : [''];
		formError = '';
		showForm = true;
	}

	function closeForm() {
		showForm = false;
	}

	function addOptionField() {
		formOptions = [...formOptions, ''];
	}
	function removeOptionField(index: number) {
		formOptions = formOptions.filter((_, i) => i !== index);
	}

	async function handleFormSubmit(e: SubmitEvent) {
		e.preventDefault();
		formError = '';

		if (!formLabel.trim()) {
			formError = 'Label pertanyaan wajib diisi.';
			return;
		}
		const needsOptions = optionTypes.includes(formType);
		const cleanOptions = formOptions.map((o) => o.trim()).filter(Boolean);
		if (needsOptions && cleanOptions.length < 2) {
			formError = 'Tipe pertanyaan ini butuh minimal 2 pilihan jawaban.';
			return;
		}

		const payload: QuestionFormData = {
			label: formLabel.trim(),
			type: formType,
			requirement: formRequirement,
			options: cleanOptions
		};

		isSubmitting = true;
		try {
			if (editingId !== null) {
				await updateQuestion(eventId, editingId, payload);
				feedback = { type: 'success', message: 'Pertanyaan berhasil diperbarui.' };
			} else {
				await createQuestion(eventId, payload);
				feedback = { type: 'success', message: 'Pertanyaan baru berhasil ditambahkan.' };
			}
			showForm = false;
			await loadData();
		} catch {
			formError = 'Gagal menyimpan pertanyaan, coba lagi.';
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		isDeleting = true;
		try {
			await deleteQuestion(eventId, deleteTarget.id);
			feedback = { type: 'success', message: `Pertanyaan "${deleteTarget.label}" dihapus.` };
			deleteTarget = null;
			await loadData();
		} catch {
			feedback = { type: 'error', message: 'Gagal menghapus pertanyaan.' };
		} finally {
			isDeleting = false;
		}
	}

	async function move(q: DynamicQuestion, direction: 'up' | 'down') {
		await reorderQuestion(eventId, q.id, direction);
		await loadData();
	}
</script>

<svelte:head>
	<title>Form Builder - Admin Panitia | EventGate</title>
</svelte:head>

<div class="space-y-6 max-w-4xl">
	<button
		onclick={() => goto('/dashboard/panitia/event-management')}
		class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
	>
		<ArrowLeft class="w-4 h-4" /> Kembali ke Event Management
	</button>

	<div class="border-b border-slate-200 pb-4">
		<h1 class="text-xl font-bold text-slate-900">Form Builder{event ? ` — ${event.title}` : ''}</h1>
		<p class="text-xs text-slate-500">Atur pertanyaan pendaftaran dinamis untuk event ini.</p>
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

	{#if isLoading}
		<div class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
			<Loader2 class="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
			<p class="text-xs font-semibold text-slate-700">Memuat form builder...</p>
		</div>
	{:else if !event}
		<p class="text-xs text-slate-400">Event tidak ditemukan.</p>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Question list -->
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<h2 class="text-sm font-bold text-slate-900">Daftar Pertanyaan ({questions.length})</h2>
					<button
						onclick={openAddForm}
						class="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-lg shadow-sm"
					>
						<Plus class="w-3.5 h-3.5" /> Tambah Pertanyaan
					</button>
				</div>

				{#if questions.length === 0}
					<div class="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
						Belum ada pertanyaan. Klik "Tambah Pertanyaan" untuk mulai.
					</div>
				{:else}
					<ul class="space-y-2">
						{#each questions as q, i (q.id)}
							<li class="bg-white border border-slate-200 rounded-xl p-3 flex items-start justify-between gap-2">
								<div class="min-w-0">
									<p class="text-xs font-semibold text-slate-900">{q.label}</p>
									<div class="flex items-center gap-1.5 mt-1 flex-wrap">
										<span class="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
											{typeLabels[q.type]}
										</span>
										<span
											class="text-[10px] font-medium px-2 py-0.5 rounded {q.requirement === 'wajib'
												? 'text-amber-700 bg-amber-50'
												: 'text-slate-500 bg-slate-100'}"
										>
											{q.requirement === 'wajib' ? 'Wajib' : 'Opsional'}
										</span>
									</div>
								</div>
								<div class="flex items-center gap-1 shrink-0">
									<button
										onclick={() => move(q, 'up')}
										disabled={i === 0}
										title="Naikkan urutan"
										class="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"
									>
										<ArrowUp class="w-3.5 h-3.5" />
									</button>
									<button
										onclick={() => move(q, 'down')}
										disabled={i === questions.length - 1}
										title="Turunkan urutan"
										class="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"
									>
										<ArrowDown class="w-3.5 h-3.5" />
									</button>
									<button
										onclick={() => openEditForm(q)}
										title="Edit"
										class="p-1 rounded text-slate-600 hover:bg-slate-100"
									>
										<Pencil class="w-3.5 h-3.5" />
									</button>
									<button
										onclick={() => (deleteTarget = q)}
										title="Hapus"
										class="p-1 rounded text-red-600 hover:bg-red-50"
									>
										<Trash2 class="w-3.5 h-3.5" />
									</button>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<!-- Add/edit form OR preview -->
			<div class="bg-white border border-slate-200 rounded-xl p-5">
				{#if showForm}
					<form onsubmit={handleFormSubmit} class="space-y-4">
						<h3 class="text-sm font-bold text-slate-900">{editingId !== null ? 'Edit Pertanyaan' : 'Pertanyaan Baru'}</h3>

						{#if formError}
							<p class="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
						{/if}

						<div class="space-y-1.5">
							<label for="q-label" class="block text-xs font-medium text-slate-700">Label Pertanyaan</label>
							<input
								id="q-label"
								type="text"
								bind:value={formLabel}
								placeholder="Contoh: Nama Lengkap"
								class="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
							/>
						</div>

						<div class="space-y-1.5">
							<label for="q-type" class="block text-xs font-medium text-slate-700">Tipe Field</label>
							<select
								id="q-type"
								bind:value={formType}
								class="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
							>
								{#each Object.entries(typeLabels) as [value, label]}
									<option {value}>{label}</option>
								{/each}
							</select>
						</div>

						<div class="space-y-1.5">
							<span class="block text-xs font-medium text-slate-700">Wajib Diisi?</span>
							<div class="flex items-center gap-4">
								<label class="flex items-center gap-1.5 text-xs cursor-pointer">
									<input type="radio" name="requirement" value="wajib" bind:group={formRequirement} />
									Wajib
								</label>
								<label class="flex items-center gap-1.5 text-xs cursor-pointer">
									<input type="radio" name="requirement" value="opsional" bind:group={formRequirement} />
									Opsional
								</label>
							</div>
						</div>

						{#if optionTypes.includes(formType)}
							<div class="space-y-1.5">
								<span class="block text-xs font-medium text-slate-700">Pilihan Jawaban (min. 2)</span>
								{#each formOptions as _, i}
									<div class="flex items-center gap-2">
										<input
											type="text"
											bind:value={formOptions[i]}
											placeholder={`Pilihan ${i + 1}`}
											class="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
										/>
										{#if formOptions.length > 1}
											<button
												type="button"
												onclick={() => removeOptionField(i)}
												class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
											>
												<Trash2 class="w-3.5 h-3.5" />
											</button>
										{/if}
									</div>
								{/each}
								<button
									type="button"
									onclick={addOptionField}
									class="text-[11px] font-semibold text-emerald-700 hover:underline"
								>
									+ Tambah Pilihan
								</button>
							</div>
						{/if}

						<div class="flex gap-2 justify-end pt-2 border-t border-slate-100">
							<button
								type="button"
								onclick={closeForm}
								class="text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100"
							>
								Batal
							</button>
							<button
								type="submit"
								disabled={isSubmitting}
								class="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 px-4 py-1.5 rounded-lg"
							>
								{isSubmitting ? 'Menyimpan...' : 'Simpan'}
							</button>
						</div>
					</form>
				{:else}
					<div class="space-y-3">
						<h3 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
							<Eye class="w-4 h-4 text-emerald-700" /> Preview Form Pendaftaran
						</h3>
						{#if questions.length === 0}
							<p class="text-xs text-slate-400">Preview akan tampil di sini setelah ada pertanyaan.</p>
						{:else}
							<div class="space-y-3">
								{#each questions as q}
									<div class="space-y-1">
										<span class="block text-xs font-medium text-slate-700">
											{q.label}{q.requirement === 'wajib' ? ' *' : ''}
										</span>
										{#if q.type === 'textarea'}
											<textarea disabled rows="2" class="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
											></textarea>
										{:else if q.type === 'select'}
											<select disabled class="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
												<option>Pilih {q.label}</option>
											</select>
										{:else if q.type === 'radio' || q.type === 'checkbox'}
											<div class="space-y-1">
												{#each q.options as opt}
													<label class="flex items-center gap-1.5 text-xs text-slate-500">
														<input type={q.type === 'radio' ? 'radio' : 'checkbox'} disabled />
														{opt.label}
													</label>
												{/each}
											</div>
										{:else if q.type === 'file_upload'}
											<input disabled type="file" class="w-full text-xs text-slate-400" />
										{:else}
											<input
												disabled
												type={q.type === 'number' ? 'number' : q.type === 'date' ? 'date' : 'text'}
												class="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
											/>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<ConfirmActionModal
	open={deleteTarget !== null}
	title="Hapus Pertanyaan?"
	description={deleteTarget ? `Pertanyaan "${deleteTarget.label}" akan dihapus permanen.` : ''}
	confirmLabel="Ya, Hapus"
	confirmClass="bg-red-600 hover:bg-red-700"
	isSubmitting={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (deleteTarget = null)}
/>
