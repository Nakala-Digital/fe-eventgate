<script lang="ts">
	import './layout.css';
	import Navbar from '$lib/components/common/Navbar.svelte';
	import Footer from '$lib/components/common/Footer.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	// Dashboard has its own sidebar-based shell; auth pages are full-bleed (no site nav) per design.
	const isFullBleed = $derived(page.url.pathname.startsWith('/dashboard') || page.url.pathname.startsWith('/auth'));
</script>

<svelte:head>
	<title>EventGate - Platform Management Event & Ticketing</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-600 selection:text-white">
	{#if !isFullBleed}
		<Navbar />
	{/if}

	<main class="flex-1 flex flex-col">
		{@render children()}
	</main>

	{#if !isFullBleed}
		<Footer />
	{/if}
</div>
