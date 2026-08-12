<script setup lang="ts">
import { useAuthStore } from "~/features/auth";

definePageMeta({ layout: false });

const route = useRoute();
const authStore = useAuthStore();
const message = ref("Завершаем вход через Яндекс ID...");

onMounted(async () => {
    try {
        const { yandexAuthProvider } = useRuntimeConfig().public;
        await useMedusaClient().auth.callback(
            "customer",
            yandexAuthProvider as string,
            route.query as Record<string, unknown>,
        );

        const customer = await authStore.restoreSession();
        if (!customer) throw new Error("Не удалось получить данные профиля.");

        await navigateTo("/");
    } catch {
        message.value = "Не удалось завершить вход. Попробуйте ещё раз.";
    }
});
</script>

<template>
    <main class="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <p class="text-sm text-black/60">{{ message }}</p>
    </main>
</template>
