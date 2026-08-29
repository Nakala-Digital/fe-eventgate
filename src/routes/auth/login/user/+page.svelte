<script lang="ts">
	import { goto } from '$app/navigation';
	import { setAuth } from '$lib/stores/authStore';
	import { login, LoginError } from '$lib/services/authApi';
	import logo from '$lib/assets/al-azhar-logo.png';
	import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-svelte';

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
	<title>Masuk User - EventGate Al-Azhar</title>
</svelte:head>

<div class="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4 py-8 sm:px-6">
	<div class="w-full max-w-sm space-y-6">
		<!-- Header Logo -->
		<div class="flex flex-col items-center gap-2">
			<img src={logo} alt="Eventgate Al-Azhar" class="h-16 w-16 rounded-2xl object-cover shadow-sm" />
			<div class="text-center leading-tight">
				<h2 class="font-extrabold text-sm text-slate-900">Eventgate Al-Azhar</h2>
				<p class="text-[11px] text-slate-500 font-medium">Syifa Budi Parahyangan</p>
			</div>
		</div>

		<!-- Title & Subtitle -->
		<div class="text-center space-y-1 pt-2">
			<h1 class="text-xl font-bold text-brand-700">Selamat Datang Kembali</h1>
			<p class="text-xs text-slate-600 leading-relaxed">
				Masuk untuk mengikuti berbagai kegiatan Al-Azhar
			</p>
		</div>

		{#if errorMessage}
			<div class="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
				{errorMessage}
			</div>
		{/if}

		<!-- Form Login -->
		<form onsubmit={handleLogin} class="space-y-4">
			<!-- Input Email -->
			<div class="space-y-1.5">
				<label for="email" class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">EMAIL</label>
				<div class="relative">
					<Mail class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
					<input
						type="email"
						id="email"
						bind:value={email}
						placeholder="Masukkan email Anda"
						class="w-full bg-white border border-slate-200 text-xs rounded-xl pl-10 pr-3.5 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent shadow-sm transition-all"
					/>
				</div>
			</div>

			<!-- Input Password -->
			<div class="space-y-1.5">
				<div class="flex justify-between items-center">
					<label for="password" class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">KATA SANDI</label>
					<a href="/auth/login/user/lupa-kata-sandi" class="text-[11px] font-medium text-brand-700 hover:underline">Lupa Password?</a>
				</div>
				<div class="relative">
					<Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
					<input
						type={showPassword ? 'text' : 'password'}
						id="password"
						bind:value={password}
						placeholder="Masukkan kata sandi Anda"
						class="w-full bg-white border border-slate-200 text-xs rounded-xl pl-10 pr-10 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent shadow-sm transition-all"
					/>
					<button
						type="button"
						class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
						onclick={() => (showPassword = !showPassword)}
						aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
					>
						{#if showPassword}
							<EyeOff class="w-4 h-4" />
						{:else}
							<Eye class="w-4 h-4" />
						{/if}
					</button>
				</div>
			</div>

			<!-- Checkbox Remember Me -->
			<div class="pt-0.5">
				<label class="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
					<input
						type="checkbox"
						bind:checked={remember}
						class="w-4 h-4 rounded border-slate-300 text-brand-700 focus:ring-brand-600 rounded-sm"
					/>
					<span>Ingatkan Akun Saya</span>
				</label>
			</div>

			<!-- Submit Button -->
			<button
				type="submit"
				disabled={isSubmitting}
				class="w-full text-sm font-bold bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
			>
				<span>{isSubmitting ? 'Memproses...' : 'Masuk'}</span>
				{#if !isSubmitting}
					<ArrowRight class="w-4 h-4" />
				{/if}
			</button>
		</form>

		<!-- Footer Help Link -->
		<p class="text-center text-xs text-slate-500 pt-2">
			Belum Punya Akun? <a href="#hubungi-admin" class="text-brand-700 font-bold hover:underline">Hubungi Admin</a>
		</p>
	</div>
</div>
