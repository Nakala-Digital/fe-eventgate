<script lang="ts">
	import { goto } from '$app/navigation';
	import { setAuth } from '$lib/stores/authStore';
	import { login, LoginError } from '$lib/services/authApi';
	import logo from '$lib/assets/al-azhar-logo.png';
	import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-svelte';

	let email = $state('');
	let password = $state('');
	let remember = $state(false);
	let showPassword = $state(false);
	let errorMessage = $state('');
	let isSubmitting = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		errorMessage = '';
		isSubmitting = true;

		try {
			const { token, user } = await login(email, password);
			setAuth(token, user, remember);
			await goto(`/dashboard/${user.role}`);
		} catch (err) {
			errorMessage = err instanceof LoginError ? err.message : 'Terjadi kesalahan, coba lagi.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Masuk Staf Lapangan - EventGate</title>
</svelte:head>

<div class="min-h-screen flex flex-col items-center px-6 py-10">
	<div class="w-full max-w-sm space-y-6">
		<div class="flex flex-col items-center gap-2 pt-4">
			<img src={logo} alt="Eventgate Al-Azhar" class="h-16 w-16 rounded-2xl object-cover shadow-sm" />
			<div class="text-center leading-tight">
				<p class="font-extrabold text-sm text-slate-900">Eventgate Al-Azhar</p>
				<p class="text-[11px] text-slate-500">Syifa Budi Parahyangan</p>
			</div>
		</div>

		<div class="text-center space-y-1 pt-4">
			<h1 class="text-xl font-bold text-brand-700">Selamat Datang Kembali</h1>
			<p class="text-xs text-slate-500 leading-relaxed">
				Masuk untuk mengikuti berbagai kegiatan Al-Azhar
			</p>
		</div>

		{#if errorMessage}
			<div class="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
				<AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
				<span>{errorMessage}</span>
			</div>
		{/if}

		<form onsubmit={handleLogin} class="space-y-4">
			<div class="space-y-1">
				<label for="email" class="text-[11px] font-bold text-slate-600 uppercase">Email</label>
				<div class="relative">
					<Mail class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
					<input
						type="email"
						id="email"
						bind:value={email}
						placeholder="Masukkan email Anda"
						required
						class="w-full bg-white border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
					/>
				</div>
			</div>

			<div class="space-y-1">
				<div class="flex justify-between items-center">
					<label for="password" class="text-[11px] font-bold text-slate-600 uppercase">Kata Sandi</label>
					<a href="/auth/login/lapangan/lupa-kata-sandi" class="text-[11px] text-brand-700 hover:underline">Lupa Password?</a>
				</div>
				<div class="relative">
					<Lock class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
					<input
						type={showPassword ? 'text' : 'password'}
						id="password"
						bind:value={password}
						placeholder="Masukkan kata sandi Anda"
						required
						class="w-full bg-white border border-slate-300 text-xs rounded-xl pl-9 pr-9 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
					/>
					<button
						type="button"
						class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
						onclick={() => (showPassword = !showPassword)}
						aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
					>
						{#if showPassword}<EyeOff class="w-4 h-4" />{:else}<Eye class="w-4 h-4" />{/if}
					</button>
				</div>
			</div>

			<label class="flex items-center gap-2 text-xs text-slate-600">
				<input type="checkbox" bind:checked={remember} class="rounded border-slate-300 text-brand-700 focus:ring-brand-600" />
				Ingatkan Akun Saya
			</label>

			<button
				type="submit"
				disabled={isSubmitting}
				class="w-full text-sm font-bold bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white py-3 rounded-full transition-all shadow flex items-center justify-center gap-1.5"
			>
				{isSubmitting ? 'Memproses...' : 'Masuk'}
				{#if !isSubmitting}<ArrowRight class="w-4 h-4" />{/if}
			</button>
		</form>

		<p class="text-center text-[11px] text-slate-500">
			Belum Punya Akun? <a href="#hubungi-admin" class="text-brand-700 font-bold hover:underline">Hubungi Admin</a>
		</p>
	</div>
</div>
