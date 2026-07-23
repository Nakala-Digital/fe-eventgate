<script lang="ts">
	import './layout.css';
	import Navbar from '$lib/components/common/Navbar.svelte';
	import Footer from '$lib/components/common/Footer.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	// Check if page is dashboard route (uses custom dashboard layout)
	const isDashboard = $derived(page.url.pathname.startsWith('/dashboard'));
</script>

<svelte:head>
	<title>EventGate - Platform Management Event & Ticketing</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white">
	{#if !isDashboard}
		<Navbar />
	{/if}

	<main class="flex-1 flex flex-col">
		{@render children()}
	</main>

	{#if !isDashboard}
		<Footer />
	{/if}
</div>
