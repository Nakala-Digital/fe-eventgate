<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowLeft, ArrowRight, Mail, Lock, Eye, EyeOff, CheckCircle2, Check, X, Save } from 'lucide-svelte';

	// Tidak ada endpoint forgot-password/reset-password/verify-code di backend (be-eventgate
	// hanya punya /auth/login & /auth/me) — alur ini murni mock di sisi client mengikuti
	// desain Forgot Password User/*.png, menunggu API resmi dari tim backend.

	type Step = 'email' | 'otp' | 'password' | 'success';
	let step = $state<Step>('email');

	let email = $state('');
	let otp = $state(['', '', '', '', '', '']);
	let otpRefs = $state<HTMLInputElement[]>([]);

	let newPassword = $state('');
	let confirmPassword = $state('');
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);
	let passwordTouched = $state(false);

	const hasUpperAndDigit = $derived(/[A-Z]/.test(newPassword) && /\d/.test(newPassword));
	const hasMinLength = $derived(newPassword.length >= 8);
	const passwordsMatch = $derived(newPassword.length > 0 && newPassword === confirmPassword);
	const canSubmitPassword = $derived(hasUpperAndDigit && hasMinLength && passwordsMatch);

	function handleEmailSubmit(e: Event) {
		e.preventDefault();
		step = 'otp';
	}

	function handleOtpInput(index: number, value: string) {
		const digit = value.replace(/\D/g, '').slice(-1);
		otp[index] = digit;
		if (digit && index < 5) otpRefs[index + 1]?.focus();
	}

	function handleOtpKeydown(index: number, e: KeyboardEvent) {
		if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs[index - 1]?.focus();
	}

	function handleOtpSubmit(e: Event) {
		e.preventDefault();
		if (otp.every((d) => d !== '')) step = 'password';
	}

	function handlePasswordSubmit(e: Event) {
		e.preventDefault();
		passwordTouched = true;
		if (canSubmitPassword) step = 'success';
	}

	function goBack() {
		if (step === 'otp') step = 'email';
		else if (step === 'password') step = 'otp';
		else goto('/auth/login/lapangan');
	}
</script>

<svelte:head>
	<title>Lupa Kata Sandi - EventGate</title>
</svelte:head>

<div class="min-h-screen flex flex-col items-center px-6 py-10">
	<div class="w-full max-w-sm space-y-6">
		{#if step !== 'success'}
			<button
				type="button"
				onclick={goBack}
				class="text-brand-700 hover:text-brand-800"
				aria-label="Kembali"
			>
				<ArrowLeft class="w-5 h-5" />
			</button>
		{/if}

		{#if step === 'email'}
			<div class="space-y-1">
				<h1 class="text-xl font-bold text-brand-700">Lupa Kata Sandi</h1>
				<p class="text-xs text-slate-500 leading-relaxed">
					Kami akan mengirimkan kode verifikasi untuk mengatur ulang kata sandi.
				</p>
			</div>

			<form onsubmit={handleEmailSubmit} class="space-y-1.5">
				<label for="fp-email" class="text-[11px] font-bold text-slate-600 uppercase">Email</label>
				<div class="relative">
					<Mail class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
					<input
						id="fp-email"
						type="email"
						bind:value={email}
						placeholder="Masukkan email Anda"
						required
						class="w-full bg-white border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
					/>
				</div>
				<p class="text-[11px] text-amber-600">Pastikan email yang sesuai dengan yang didaftarkan</p>

				<button
					type="submit"
					class="w-full text-sm font-bold bg-brand-700 hover:bg-brand-800 text-white py-3 rounded-full transition-all shadow flex items-center justify-center gap-1.5 mt-3"
				>
					Kirim Kode Verifikasi <ArrowRight class="w-4 h-4" />
				</button>
			</form>
		{:else if step === 'otp'}
			<div class="space-y-1">
				<h1 class="text-xl font-bold text-brand-700">Kode Verifikasi</h1>
				<p class="text-xs text-slate-500 leading-relaxed">
					Masukkan 6 digit kode yang telah kami kirim ke email {email || 'Anda'}
				</p>
			</div>

			<form onsubmit={handleOtpSubmit} class="space-y-4">
				<div class="flex gap-2 justify-between">
					{#each otp as digit, i (i)}
						<input
							bind:this={otpRefs[i]}
							type="text"
							inputmode="numeric"
							maxlength="1"
							value={digit}
							oninput={(e) => handleOtpInput(i, e.currentTarget.value)}
							onkeydown={(e) => handleOtpKeydown(i, e)}
							class="w-11 h-12 text-center text-lg font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600"
						/>
					{/each}
				</div>

				<button
					type="submit"
					disabled={!otp.every((d) => d !== '')}
					class="w-full text-sm font-bold bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white py-3 rounded-full transition-all shadow flex items-center justify-center gap-1.5"
				>
					Verifikasi Kode <ArrowRight class="w-4 h-4" />
				</button>
			</form>
		{:else if step === 'password'}
			<div class="space-y-1">
				<h1 class="text-xl font-bold text-brand-700">Buat Kata Sandi Baru</h1>
				<p class="text-xs text-slate-500 leading-relaxed">Masukkan kata sandi baru untuk akun Anda</p>
			</div>

			<form onsubmit={handlePasswordSubmit} class="space-y-4">
				<div class="space-y-1">
					<label for="new-password" class="text-[11px] font-bold text-slate-600 uppercase">Kata Sandi Baru</label>
					<div class="relative">
						<Lock class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							id="new-password"
							type={showNewPassword ? 'text' : 'password'}
							bind:value={newPassword}
							placeholder="Masukkan kata sandi Baru Anda"
							class="w-full bg-white border text-xs rounded-xl pl-9 pr-9 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600 {passwordTouched && !canSubmitPassword ? 'border-red-400' : 'border-slate-300'}"
						/>
						<button
							type="button"
							class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							onclick={() => (showNewPassword = !showNewPassword)}
							aria-label={showNewPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
						>
							{#if showNewPassword}<EyeOff class="w-4 h-4" />{:else}<Eye class="w-4 h-4" />{/if}
						</button>
					</div>
				</div>

				<div class="space-y-1">
					<label for="confirm-password" class="text-[11px] font-bold text-slate-600 uppercase">Konfirmasi Kata Sandi Baru</label>
					<div class="relative">
						<Lock class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							id="confirm-password"
							type={showConfirmPassword ? 'text' : 'password'}
							bind:value={confirmPassword}
							placeholder="Konfirmasi kata sandi Baru Anda"
							class="w-full bg-white border text-xs rounded-xl pl-9 pr-9 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600 {passwordTouched && !canSubmitPassword ? 'border-red-400' : 'border-slate-300'}"
						/>
						<button
							type="button"
							class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							onclick={() => (showConfirmPassword = !showConfirmPassword)}
							aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
						>
							{#if showConfirmPassword}<EyeOff class="w-4 h-4" />{:else}<Eye class="w-4 h-4" />{/if}
						</button>
					</div>
				</div>

				<ul class="space-y-1 text-[11px]">
					<li class="flex items-center gap-1.5 {passwordTouched ? (hasUpperAndDigit ? 'text-brand-700' : 'text-red-500') : 'text-slate-400'}">
						{#if passwordTouched}{#if hasUpperAndDigit}<Check class="w-3.5 h-3.5" />{:else}<X class="w-3.5 h-3.5" />{/if}{:else}<Check class="w-3.5 h-3.5" />{/if}
						Mengandung huruf besar & angka
					</li>
					<li class="flex items-center gap-1.5 {passwordTouched ? (hasMinLength ? 'text-brand-700' : 'text-red-500') : 'text-slate-400'}">
						{#if passwordTouched}{#if hasMinLength}<Check class="w-3.5 h-3.5" />{:else}<X class="w-3.5 h-3.5" />{/if}{:else}<Check class="w-3.5 h-3.5" />{/if}
						Minimal 8 karakter
					</li>
					<li class="flex items-center gap-1.5 {passwordTouched ? (passwordsMatch ? 'text-brand-700' : 'text-red-500') : 'text-slate-400'}">
						{#if passwordTouched}{#if passwordsMatch}<Check class="w-3.5 h-3.5" />{:else}<X class="w-3.5 h-3.5" />{/if}{:else}<Check class="w-3.5 h-3.5" />{/if}
						Kata sandi cocok
					</li>
				</ul>

				<button
					type="submit"
					disabled={passwordTouched && !canSubmitPassword}
					class="w-full text-sm font-bold bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white py-3 rounded-full transition-all shadow flex items-center justify-center gap-1.5"
				>
					Simpan Kata Sandi <Save class="w-4 h-4" />
				</button>
			</form>
		{:else}
			<div class="flex flex-col items-center text-center gap-3 pt-16">
				<div class="h-14 w-14 rounded-full bg-brand-100 flex items-center justify-center">
					<CheckCircle2 class="w-8 h-8 text-brand-600" />
				</div>
				<h1 class="text-lg font-bold text-brand-700">Kata Sandi Berhasil Diperbarui!</h1>
				<p class="text-xs text-slate-500 leading-relaxed max-w-xs">
					Kata sandi Anda telah berhasil diubah. Silakan masuk kembali menggunakan kata sandi baru Anda.
				</p>
				<a
					href="/auth/login/lapangan"
					class="w-full text-sm font-bold bg-brand-700 hover:bg-brand-800 text-white py-3 rounded-full transition-all shadow flex items-center justify-center gap-1.5 mt-2"
				>
					Kembali Login <ArrowRight class="w-4 h-4" />
				</a>
			</div>
		{/if}
	</div>
</div>
