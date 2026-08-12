<script setup lang="ts">
import { useAuthStore } from "../lib/auth.store";

const authStore = useAuthStore();

function openAuth() {
    void openAccountOrAuth();
}

async function openAccountOrAuth() {
    const customer = await authStore.restoreSession();

    if (customer) {
        await navigateTo("/account");
        return;
    }

    authStore.isOpen = true;
}
</script>

<template>
    <button
        type="button"
        class="flex cursor-pointer items-center justify-center"
        :aria-label="authStore.isAuthenticated ? 'Личный кабинет' : 'Войти в личный кабинет'"
        :aria-busy="authStore.isCheckingSession"
        @click="openAuth"
    >
        <SvgoAccount aria-hidden="true" filled class="!mb-0 text-2xl" />
    </button>
</template>
