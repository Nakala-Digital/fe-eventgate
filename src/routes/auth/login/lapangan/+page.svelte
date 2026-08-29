<script lang="ts">
	import { goto } from '$app/navigation';
	import { setAuth } from '$lib/stores/authStore';
	import { login, LoginError } from '$lib/services/authApi';
	import UserLoginForm from '$lib/components/auth/UserLoginForm.svelte';

	let email = $state('');
	let password = $state('');
	let remember = $state(false);
	let showPassword = $state(false);
	let emailError = $state('');
	let passwordError = $state('');
	let errorMessage = $state('');
	let isSubmitting = $state(false);

	function handleEmailInput(val: string) {
		email = val;
		if (emailError && val.trim()) {
			emailError = '';
		}
	}

	function handlePasswordInput(val: string) {
		password = val;
		if (passwordError && val) {
			passwordError = '';
		}
	}

	async function handleLogin(e: Event) {
		e.preventDefault();
		errorMessage = '';
		emailError = '';
		passwordError = '';

		let isValid = true;
		if (!email.trim()) {
			emailError = 'Email tidak boleh kosong';
			isValid = false;
		}
		if (!password) {
			passwordError = 'Kata sandi tidak boleh kosong';
			isValid = false;
		}

		if (!isValid) return;

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
	<UserLoginForm
		bind:email
		bind:password
		bind:remember
		bind:showPassword
		{emailError}
		{passwordError}
		globalError={errorMessage}
		{isSubmitting}
		forgotPasswordHref="/auth/login/lapangan/lupa-kata-sandi"
		onSubmit={handleLogin}
		onEmailInput={handleEmailInput}
		onPasswordInput={handlePasswordInput}
	/>
</div>
