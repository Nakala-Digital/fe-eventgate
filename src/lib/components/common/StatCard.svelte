<script lang="ts">
	let { title, value, description, icon: IconComponent }: {
		title: string;
		value: string;
		description?: string;
		icon?: any;
	} = $props();
</script>

<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
	<div class="flex items-center justify-between">
		<span class="text-xs text-slate-500 font-medium">{title}</span>
		{#if IconComponent}
			{@const Icon = IconComponent}
			<div class="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
				<Icon class="w-4 h-4" />
			</div>
		{/if}
	</div>
	<h3 class="text-xl font-bold text-slate-900">{value}</h3>
	{#if description}
		<p class="text-[11px] text-slate-500">{description}</p>
	{/if}
</div>
