<script lang="ts">
	import { setMockUserRole, type UserRole } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import { Ticket } from 'lucide-svelte';

	let email = $state('user@eventgate.id');
	let password = $state('password123');
	let selectedRole = $state<UserRole>('super-admin');

	function handleLogin(e: Event) {
		e.preventDefault();
		setMockUserRole(selectedRole);
		goto(`/dashboard/${selectedRole}`);
	}
</script>

<svelte:head>
	<title>Masuk - EventGate</title>
</svelte:head>

<div class="py-12 px-4 flex items-center justify-center min-h-[calc(100vh-140px)]">
	<div class="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
		<!-- Left Form Section (Matching wireframe/image.png) -->
		<div class="p-8 space-y-6 flex flex-col justify-between">
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<div class="h-7 w-7 rounded bg-emerald-700 flex items-center justify-center text-white">
						<Ticket class="w-4 h-4" />
					</div>
					<span class="font-bold text-sm text-slate-900">EventGate</span>
				</div>

				<div class="space-y-1">
					<h1 class="text-xl font-bold text-slate-900">Masuk ke Portal Penyelenggara</h1>
					<p class="text-xs text-slate-500">Pusat kontrol untuk mengelola seluruh rangkaian acara terintegrasi.</p>
				</div>

				<!-- Role Toggle Tabs -->
				<div class="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
					<button
						type="button"
						class="flex-1 py-1.5 rounded-lg font-semibold transition-colors {selectedRole === 'super-admin' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'text-slate-600 hover:text-slate-900'}"
						onclick={() => (selectedRole = 'super-admin')}
					>
						Super Admin
					</button>
					<button
						type="button"
						class="flex-1 py-1.5 rounded-lg font-semibold transition-colors {selectedRole === 'panitia' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'text-slate-600 hover:text-slate-900'}"
						onclick={() => (selectedRole = 'panitia')}
					>
						Admin
					</button>
				</div>

				<form onsubmit={handleLogin} class="space-y-3 pt-2">
					<div class="space-y-1">
						<label for="email" class="text-[11px] font-bold text-slate-600 uppercase">EMAIL</label>
						<input
							type="email"
							id="email"
							bind:value={email}
							placeholder="Masukkan email Anda"
							required
							class="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
						/>
					</div>

					<div class="space-y-1">
						<div class="flex justify-between items-center">
							<label for="password" class="text-[11px] font-bold text-slate-600 uppercase">KATA SANDI</label>
							<a href="#lupa" class="text-[10px] text-emerald-700 hover:underline">Lupa kata sandi?</a>
						</div>
						<input
							type="password"
							id="password"
							bind:value={password}
							placeholder="Masukkan kata sandi Anda"
							required
							class="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
						/>
					</div>

					<button
						type="submit"
						class="w-full text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl transition-all mt-3 shadow"
					>
						Masuk
					</button>
				</form>
			</div>

			<div class="text-center text-[11px] text-slate-500 border-t border-slate-100 pt-3">
				Mengalami Kendala? <a href="#help" class="text-emerald-700 font-bold hover:underline">Hubungi Kami</a>
			</div>
		</div>

		<!-- Right Green Banner (Matching wireframe/image.png right side) -->
		<div class="bg-emerald-800 p-8 text-white hidden md:flex flex-col justify-center space-y-4 relative overflow-hidden">
			<div class="space-y-2 relative z-10">
				<span class="text-[10px] bg-emerald-900/60 text-emerald-200 border border-emerald-600/40 px-2.5 py-1 rounded-full uppercase font-bold">
					EventGate System
				</span>
				<h2 class="text-2xl font-extrabold leading-tight">
					Mulai langkah baru menuju masa depan.
				</h2>
				<p class="text-xs text-emerald-100 opacity-90 leading-relaxed">
					Sistem manajemen event terintegrasi untuk pengelolaan peserta, pendaftaran dinamis, dan verifikasi QR ticket.
				</p>
			</div>
		</div>
	</div>
</div>
