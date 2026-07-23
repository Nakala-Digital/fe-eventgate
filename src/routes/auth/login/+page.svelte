<script lang="ts">
	import { goto } from '$app/navigation';
	import { setAuth } from '$lib/stores/authStore';
	import { login, LoginError } from '$lib/services/authApi';
	import { Ticket, Mail, Lock, Eye, EyeOff } from 'lucide-svelte';

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
	<title>Masuk - EventGate</title>
</svelte:head>

<div class="py-12 px-4 flex items-center justify-center min-h-[calc(100vh-140px)]">
	<div class="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-xl p-8 space-y-6">
		<div class="flex flex-col items-center text-center space-y-2">
			<div class="h-14 w-14 rounded-2xl bg-emerald-700 flex items-center justify-center text-white">
				<Ticket class="w-7 h-7" />
			</div>
			<span class="font-bold text-slate-900">EventGate</span>
		</div>

		<div class="text-center space-y-1">
			<h1 class="text-xl font-bold text-emerald-700">Selamat Datang Kembali</h1>
			<p class="text-xs text-slate-500">Masuk untuk mengelola kegiatan Anda</p>
		</div>

		{#if errorMessage}
			<p class="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorMessage}</p>
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
						class="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
					/>
				</div>
			</div>

			<div class="space-y-1">
				<div class="flex justify-between items-center">
					<label for="password" class="text-[11px] font-bold text-slate-600 uppercase">Kata Sandi</label>
					<a href="#lupa" class="text-[10px] text-emerald-700 hover:underline">Lupa Password?</a>
				</div>
				<div class="relative">
					<Lock class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
					<input
						type={showPassword ? 'text' : 'password'}
						id="password"
						bind:value={password}
						placeholder="Masukkan kata sandi Anda"
						required
						class="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-9 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
				<input type="checkbox" bind:checked={remember} class="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600" />
				Ingatkan Akun Saya
			</label>

			<button
				type="submit"
				disabled={isSubmitting}
				class="w-full text-xs font-bold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white py-3 rounded-xl transition-all shadow"
			>
				{isSubmitting ? 'Memproses...' : 'Masuk'}
			</button>
		</form>

		<div class="text-center text-[11px] text-slate-500 border-t border-slate-100 pt-3">
			Belum Punya Akun? <a href="#hubungi-admin" class="text-emerald-700 font-bold hover:underline">Hubungi Admin</a>
		</div>
	</div>
</div>
