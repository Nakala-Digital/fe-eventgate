<script lang="ts">
	import type { EventFormData, ManagedEvent, TicketTypeMode } from '$lib/services/eventApi';
	import { ArrowLeft, Loader2, Calendar, MapPin, Tag, UserCheck, DollarSign, Users, AlertCircle } from 'lucide-svelte';

	interface Props {
		initialData?: Partial<ManagedEvent>;
		isEdit?: boolean;
		isSubmitting?: boolean;
		errorMessage?: string | null;
		onSubmit: (formData: EventFormData) => Promise<void>;
		onCancel: () => void;
	}

	let {
		initialData = {},
		isEdit = false,
		isSubmitting = false,
		errorMessage = null,
		onSubmit,
		onCancel
	}: Props = $props();

	// Form fields reactive state
	let title = $state('');
	let category = $state('Akademik');
	let organizer_name = $state('');
	let description = $state('');
	let start_date = $state('');
	let end_date = $state('');
	let location = $state('');
	let banner_url = $state('');
	let ticket_type = $state<TicketTypeMode>('gratis');
	let price = $state<number>(0);
	let quota = $state<number>(100);

	$effect(() => {
		if (initialData) {
			title = initialData.title ?? '';
			category = initialData.category ?? 'Akademik';
			organizer_name = initialData.organizer_name ?? '';
			description = initialData.description ?? '';
			start_date = initialData.start_date ?? '';
			end_date = initialData.end_date ?? '';
			location = initialData.location ?? '';
			banner_url = initialData.banner_url ?? '';
			ticket_type = initialData.ticket_type ?? 'gratis';
			price = initialData.price ?? 0;
			quota = initialData.quota ?? 100;
		}
	});

	// Validation errors
	let errors = $state<Record<string, string>>({});

	const categories = ['Akademik', 'Non-Akademik', 'Seminar', 'Workshop', 'Festival', 'Lainnya'];

	function validate(): boolean {
		const newErrors: Record<string, string> = {};

		if (!title.trim()) {
			newErrors.title = 'Nama event wajib diisi.';
		}
		if (!category.trim()) {
			newErrors.category = 'Kategori wajib dipilih.';
		}
		if (!organizer_name.trim()) {
			newErrors.organizer_name = 'Penyelenggara wajib diisi.';
		}
		if (!description.trim()) {
			newErrors.description = 'Deskripsi event wajib diisi.';
		}
		if (!start_date) {
			newErrors.start_date = 'Tanggal & waktu mulai wajib diisi.';
		}
		if (!end_date) {
			newErrors.end_date = 'Tanggal & waktu selesai wajib diisi.';
		} else if (start_date && new Date(end_date) < new Date(start_date)) {
			newErrors.end_date = 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.';
		}
		if (!location.trim()) {
			newErrors.location = 'Lokasi event wajib diisi.';
		}
		if (!quota || quota <= 0) {
			newErrors.quota = 'Kuota tiket harus lebih besar dari 0.';
		}

		// Acceptance Criteria: Event berbayar menampilkan input harga & wajib diisi > 0; Event gratis tidak wajib mengisi harga.
		if (ticket_type === 'berbayar') {
			if (price === undefined || price === null || price <= 0) {
				newErrors.price = 'Harga tiket untuk event berbayar wajib lebih besar dari Rp 0.';
			}
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!validate()) return;

		const payload: EventFormData = {
			title: title.trim(),
			category,
			organizer_name: organizer_name.trim(),
			description: description.trim(),
			start_date,
			end_date,
			location: location.trim(),
			banner_url: banner_url.trim(),
			ticket_type,
			price: ticket_type === 'gratis' ? 0 : Number(price),
			quota: Number(quota)
		};

		await onSubmit(payload);
	}
</script>

<form onsubmit={handleSubmit} class="space-y-6 max-w-4xl bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
	<div class="flex items-center justify-between border-b border-slate-200 pb-4">
		<div>
			<h2 class="text-lg font-bold text-slate-900">
				{isEdit ? 'Edit Event' : 'Buat Event Baru'}
			</h2>
			<p class="text-xs text-slate-500">Isi formulir di bawah ini untuk {isEdit ? 'mengubah data' : 'membuat'} event.</p>
		</div>
		<button
			type="button"
			onclick={onCancel}
			class="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
		>
			<ArrowLeft class="w-3.5 h-3.5" /> Kembali
		</button>
	</div>

	{#if errorMessage}
		<div class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
			<AlertCircle class="w-4 h-4 shrink-0" />
			<span>{errorMessage}</span>
		</div>
	{/if}

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Section 1: Informasi Utama Event -->
		<div class="space-y-4 md:col-span-2">
			<h3 class="text-xs font-semibold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded inline-block">
				Informasi Utama
			</h3>
		</div>

		<!-- Nama Event -->
		<div class="space-y-1.5 md:col-span-2">
			<label for="event-title" class="block text-xs font-medium text-slate-700">
				Nama Event <span class="text-red-500">*</span>
			</label>
			<input
				id="event-title"
				type="text"
				bind:value={title}
				placeholder="Contoh: Classmeet Al-Azhar 2026"
				class="w-full text-xs border rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 {errors.title ? 'border-red-500' : 'border-slate-300'}"
			/>
			{#if errors.title}
				<p class="text-[11px] text-red-500 mt-0.5">{errors.title}</p>
			{/if}
		</div>

		<!-- Kategori -->
		<div class="space-y-1.5">
			<label for="event-category" class="block text-xs font-medium text-slate-700">
				Kategori Event <span class="text-red-500">*</span>
			</label>
			<div class="relative">
				<select
					id="event-category"
					bind:value={category}
					class="w-full text-xs border rounded-lg px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 {errors.category ? 'border-red-500' : 'border-slate-300'}"
				>
					{#each categories as cat}
						<option value={cat}>{cat}</option>
					{/each}
				</select>
			</div>
			{#if errors.category}
				<p class="text-[11px] text-red-500 mt-0.5">{errors.category}</p>
			{/if}
		</div>

		<!-- Penyelenggara -->
		<div class="space-y-1.5">
			<label for="event-organizer" class="block text-xs font-medium text-slate-700">
				Nama Penyelenggara <span class="text-red-500">*</span>
			</label>
			<div class="relative">
				<input
					id="event-organizer"
					type="text"
					bind:value={organizer_name}
					placeholder="Contoh: OSIS Al-Azhar"
					class="w-full text-xs border rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 {errors.organizer_name ? 'border-red-500' : 'border-slate-300'}"
				/>
			</div>
			{#if errors.organizer_name}
				<p class="text-[11px] text-red-500 mt-0.5">{errors.organizer_name}</p>
			{/if}
		</div>

		<!-- Deskripsi Event -->
		<div class="space-y-1.5 md:col-span-2">
			<label for="event-description" class="block text-xs font-medium text-slate-700">
				Deskripsi Event <span class="text-red-500">*</span>
			</label>
			<textarea
				id="event-description"
				rows="3"
				bind:value={description}
				placeholder="Jelaskan secara singkat mengenai event ini..."
				class="w-full text-xs border rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 {errors.description ? 'border-red-500' : 'border-slate-300'}"
			></textarea>
			{#if errors.description}
				<p class="text-[11px] text-red-500 mt-0.5">{errors.description}</p>
			{/if}
		</div>

		<!-- Section 2: Waktu & Lokasi -->
		<div class="space-y-4 md:col-span-2 pt-2 border-t border-slate-100">
			<h3 class="text-xs font-semibold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded inline-block">
				Waktu & Lokasi
			</h3>
		</div>

		<!-- Tanggal Mulai -->
		<div class="space-y-1.5">
			<label for="start-date" class="block text-xs font-medium text-slate-700">
				Waktu Mulai <span class="text-red-500">*</span>
			</label>
			<input
				id="start-date"
				type="datetime-local"
				bind:value={start_date}
				class="w-full text-xs border rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 {errors.start_date ? 'border-red-500' : 'border-slate-300'}"
			/>
			{#if errors.start_date}
				<p class="text-[11px] text-red-500 mt-0.5">{errors.start_date}</p>
			{/if}
		</div>

		<!-- Tanggal Selesai -->
		<div class="space-y-1.5">
			<label for="end-date" class="block text-xs font-medium text-slate-700">
				Waktu Selesai <span class="text-red-500">*</span>
			</label>
			<input
				id="end-date"
				type="datetime-local"
				bind:value={end_date}
				class="w-full text-xs border rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 {errors.end_date ? 'border-red-500' : 'border-slate-300'}"
			/>
			{#if errors.end_date}
				<p class="text-[11px] text-red-500 mt-0.5">{errors.end_date}</p>
			{/if}
		</div>

		<!-- Lokasi -->
		<div class="space-y-1.5 md:col-span-2">
			<label for="event-location" class="block text-xs font-medium text-slate-700">
				Lokasi / Tempat Event <span class="text-red-500">*</span>
			</label>
			<input
				id="event-location"
				type="text"
				bind:value={location}
				placeholder="Contoh: Aula Serbaguna Gedung B / Zoom Meeting"
				class="w-full text-xs border rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 {errors.location ? 'border-red-500' : 'border-slate-300'}"
			/>
			{#if errors.location}
				<p class="text-[11px] text-red-500 mt-0.5">{errors.location}</p>
			{/if}
		</div>

		<!-- Section 3: Tiket & Media -->
		<div class="space-y-4 md:col-span-2 pt-2 border-t border-slate-100">
			<h3 class="text-xs font-semibold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded inline-block">
				Tiket & Media
			</h3>
		</div>

		<!-- Jenis Event / Tipe Tiket -->
		<div class="space-y-1.5">
			<span class="block text-xs font-medium text-slate-700">
				Tipe Event <span class="text-red-500">*</span>
			</span>
			<div class="flex items-center gap-4 pt-1">
				<label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
					<input
						type="radio"
						name="ticket_type"
						value="gratis"
						bind:group={ticket_type}
						class="text-emerald-600 focus:ring-emerald-500"
					/>
					<span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Gratis</span>
				</label>
				<label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
					<input
						type="radio"
						name="ticket_type"
						value="berbayar"
						bind:group={ticket_type}
						class="text-emerald-600 focus:ring-emerald-500"
					/>
					<span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Berbayar</span>
				</label>
			</div>
		</div>

		<!-- Kuota Tiket -->
		<div class="space-y-1.5">
			<label for="event-quota" class="block text-xs font-medium text-slate-700">
				Kuota Peserta <span class="text-red-500">*</span>
			</label>
			<input
				id="event-quota"
				type="number"
				min="1"
				bind:value={quota}
				placeholder="100"
				class="w-full text-xs border rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 {errors.quota ? 'border-red-500' : 'border-slate-300'}"
			/>
			{#if errors.quota}
				<p class="text-[11px] text-red-500 mt-0.5">{errors.quota}</p>
			{/if}
		</div>

		<!-- Input Harga (Conditional: Event Berbayar menampilkan input harga, gratis tidak wajib) -->
		{#if ticket_type === 'berbayar'}
			<div class="space-y-1.5 md:col-span-2">
				<label for="event-price" class="block text-xs font-medium text-slate-700">
					Harga Tiket (Rp) <span class="text-red-500">*</span>
				</label>
				<div class="relative">
					<span class="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">Rp</span>
					<input
						id="event-price"
						type="number"
						min="1"
						step="1000"
						bind:value={price}
						placeholder="50000"
						class="w-full text-xs border rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 {errors.price ? 'border-red-500' : 'border-slate-300'}"
					/>
				</div>
				{#if errors.price}
					<p class="text-[11px] text-red-500 mt-0.5">{errors.price}</p>
				{/if}
			</div>
		{:else}
			<div class="space-y-1.5 md:col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
				<p class="text-xs text-slate-500">
					💡 Event Gratis: Input harga disembunyikan. Tiket dapat diklaim secara gratis oleh peserta.
				</p>
			</div>
		{/if}

		<!-- Banner URL -->
		<div class="space-y-1.5 md:col-span-2">
			<label for="event-banner" class="block text-xs font-medium text-slate-700">
				URL Banner / Poster Event (Opsional)
			</label>
			<input
				id="event-banner"
				type="url"
				bind:value={banner_url}
				placeholder="https://example.com/banner.jpg"
				class="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
			/>
			{#if banner_url}
				<div class="mt-2 rounded-lg overflow-hidden border border-slate-200 max-h-40 bg-slate-100 flex items-center justify-center">
					<img src={banner_url} alt="Preview Banner" class="max-h-40 object-cover w-full" />
				</div>
			{/if}
		</div>
	</div>

	<!-- Submit actions -->
	<div class="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
		<button
			type="button"
			onclick={onCancel}
			class="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-medium transition"
		>
			Batal
		</button>
		<button
			type="submit"
			disabled={isSubmitting}
			class="flex items-center gap-2 text-xs text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 px-5 py-2 rounded-lg font-semibold shadow-sm transition"
		>
			{#if isSubmitting}
				<Loader2 class="w-4 h-4 animate-spin" /> Menyimpan...
			{:else}
				{isEdit ? 'Simpan Perubahan' : 'Buat Event'}
			{/if}
		</button>
	</div>
</form>
