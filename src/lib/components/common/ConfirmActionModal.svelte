<script lang="ts">
	interface Props {
		open: boolean;
		title: string;
		description: string;
		requireReason?: boolean;
		reasonLabel?: string;
		confirmLabel: string;
		confirmClass?: string;
		isSubmitting?: boolean;
		onConfirm: (reason?: string) => void;
		onCancel: () => void;
	}

	let {
		open,
		title,
		description,
		requireReason = false,
		reasonLabel = 'Alasan (wajib)',
		confirmLabel,
		confirmClass = 'bg-emerald-700 hover:bg-emerald-800',
		isSubmitting = false,
		onConfirm,
		onCancel
	}: Props = $props();

	let reason = $state('');
	let validationError = $state('');

	$effect(() => {
		if (open) {
			reason = '';
			validationError = '';
		}
	});

	function handleConfirm() {
		if (requireReason && !reason.trim()) {
			validationError = 'Alasan wajib diisi.';
			return;
		}
		onConfirm(requireReason ? reason.trim() : undefined);
	}
</script>

{#if open}
	<div class="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
			<div>
				<h3 class="text-sm font-bold text-slate-900">{title}</h3>
				<p class="text-xs text-slate-500 mt-1">{description}</p>
			</div>

			{#if requireReason}
				<div class="space-y-1">
					<label for="confirm-modal-reason" class="text-[11px] font-bold text-slate-600 uppercase">{reasonLabel}</label>
					<textarea
						id="confirm-modal-reason"
						bind:value={reason}
						rows="3"
						placeholder="Jelaskan alasannya..."
						class="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
					></textarea>
					{#if validationError}
						<p class="text-[11px] text-red-600">{validationError}</p>
					{/if}
				</div>
			{/if}

			<div class="flex gap-2 justify-end pt-1">
				<button
					onclick={onCancel}
					disabled={isSubmitting}
					class="text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-60"
				>
					Batal
				</button>
				<button
					onclick={handleConfirm}
					disabled={isSubmitting}
					class="text-xs font-bold text-white px-4 py-1.5 rounded-lg disabled:opacity-60 {confirmClass}"
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
