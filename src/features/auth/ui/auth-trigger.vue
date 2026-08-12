<script setup lang="ts">
import { useAuthStore } from "../lib/auth.store";

const authStore = useAuthStore();

function openAuth() {
    void authStore.open();
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
