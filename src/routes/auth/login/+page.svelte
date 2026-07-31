<script lang="ts">
	import { goto } from '$app/navigation';
	import { setAuth } from '$lib/stores/authStore';
	import { login, LoginError } from '$lib/services/authApi';
	import logo from '$lib/assets/al-azhar-logo.png';
	import heroPhoto from '$lib/assets/login-hero-photo.jpg';
	import { Mail, Lock, Eye, EyeOff, ArrowRight, Star, Calendar, Users, UserSquare } from 'lucide-svelte';

	const stats = [
		{ icon: Calendar, value: '50+', label: 'Total Acara' },
		{ icon: Users, value: '1.240+', label: 'Peserta Terdaftar' },
		{ icon: UserSquare, value: '10+', label: 'Penyelenggara' }
	];

	let selectedPortal = $state<'super-admin' | 'panitia'>('super-admin');
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

<div class="h-screen flex overflow-hidden">
	<!-- Left: Form panel -->
	<div class="w-full lg:w-[45%] flex items-center justify-center px-6 py-10 sm:px-10 overflow-y-auto">
		<div class="w-full max-w-md space-y-6">
			<a href="/" class="flex items-center gap-2.5">
				<img src={logo} alt="Eventgate Al-Azhar" class="h-10 w-10 rounded-lg object-cover shadow-sm" />
				<div class="flex flex-col leading-tight">
					<span class="font-extrabold text-sm text-slate-900">Eventgate Al-Azhar</span>
					<span class="text-[11px] text-slate-500">Syifa Budi Parahyangan</span>
				</div>
			</a>

			<div class="bg-brand-50/60 rounded-2xl p-6 sm:p-7 space-y-5">
				<div class="space-y-1">
					<h1 class="text-xl font-bold text-brand-700">Masuk ke Portal Penyelenggara</h1>
					<p class="text-xs text-slate-500 leading-relaxed">
						Pusat kontrol untuk mengelola seluruh rangkaian acara yang terintegrasi.
					</p>
				</div>

				<div class="flex items-center gap-1 text-xs font-semibold">
					<button
						type="button"
						onclick={() => (selectedPortal = 'super-admin')}
						class="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors {selectedPortal === 'super-admin'
							? 'bg-brand-50 text-brand-700'
							: 'text-slate-500 hover:text-slate-700'}"
					>
						Super Admin <ArrowRight class="w-3 h-3" />
					</button>
					<button
						type="button"
						onclick={() => (selectedPortal = 'panitia')}
						class="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors {selectedPortal === 'panitia'
							? 'bg-brand-50 text-brand-700'
							: 'text-slate-500 hover:text-slate-700'}"
					>
						Admin <ArrowRight class="w-3 h-3" />
					</button>
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
								class="w-full bg-white border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
							/>
						</div>
					</div>

					<div class="space-y-1">
						<div class="flex justify-between items-center">
							<label for="password" class="text-[11px] font-bold text-slate-600 uppercase">Kata Sandi</label>
							<a href="#lupa" class="text-[11px] text-brand-700 hover:underline">Lupa kata sandi?</a>
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
						class="w-full text-sm font-bold bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white py-3 rounded-full transition-all shadow"
					>
						{isSubmitting ? 'Memproses...' : 'Masuk'}
					</button>
				</form>

				<div class="text-center text-[11px] text-slate-500">
					Mengalami Kendala? <a href="#hubungi-kami" class="text-brand-700 font-bold hover:underline">Hubungi Kami</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Right: Hero panel — photo + gradient overlay coded in CSS, copy/badge/stats are real markup -->
	<div class="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
		<img src={heroPhoto} alt="" class="absolute inset-0 w-full h-full object-cover" />
		<div class="absolute inset-0 bg-gradient-to-b from-brand-600/80 via-brand-800/85 to-brand-950/95"></div>

		<span
			class="relative z-10 self-start inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/15 border border-white/25 rounded-full px-4 py-1.5 backdrop-blur-sm"
		>
			<Star class="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
			Sistem Manajemen Acara
		</span>

		<div class="relative z-10 space-y-4 max-w-xl">
			<h2 class="text-4xl xl:text-5xl font-extrabold leading-tight text-white">
				Kelola Acara<br />
				<span class="text-brand-200">Lebih Mudah</span><br />
				Dalam Satu Portal
			</h2>
			<p class="text-sm text-white/85 leading-relaxed">
				Portal resmi untuk mengelola seluruh kegiatan dan acara di lingkungan Al-Azhar Syifa Budi Parahyangan secara
				terintegrasi.
			</p>
		</div>

		<div class="relative z-10 grid grid-cols-3 gap-4">
			{#each stats as stat}
				{@const Icon = stat.icon}
				<div class="bg-white/10 border border-white/15 backdrop-blur-sm rounded-xl p-4 space-y-2">
					<div class="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
						<Icon class="w-4 h-4 text-white" />
					</div>
					<p class="text-2xl font-extrabold text-white">{stat.value}</p>
					<p class="text-xs text-white/75">{stat.label}</p>
				</div>
			{/each}
		</div>
	</div>
</div>
