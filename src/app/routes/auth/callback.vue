<script setup lang="ts">
import { useAuthStore } from "~/features/auth/lib/auth.store";

definePageMeta({ layout: false });

const route = useRoute();
const authStore = useAuthStore();
const message = ref("Завершаем вход через Яндекс ID...");
const isCompleting = ref(false);

type AuthTokenPayload = {
    actor_id?: string;
    user_metadata?: {
        email?: string;
        first_name?: string;
        last_name?: string;
    };
};

function decodeAuthToken(token: string): AuthTokenPayload {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) {
        throw new Error("Яндекс ID вернул некорректный токен авторизации.");
    }

    const base64 = encodedPayload
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

    return JSON.parse(new TextDecoder().decode(bytes)) as AuthTokenPayload;
}

function getCallbackErrorMessage(error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "";

    if (/code has expired/i.test(errorMessage)) {
        return "Срок действия кода Яндекс ID истек. Начните вход заново.";
    }

    return "Не удалось завершить вход. Попробуйте ещё раз.";
}

onMounted(async () => {
    if (isCompleting.value) return;
    isCompleting.value = true;

    try {
        const { yandexAuthProvider } = useRuntimeConfig().public;
        const client = useMedusaClient();
        const token = await client.auth.callback(
            "customer",
            yandexAuthProvider as string,
            route.query as Record<string, unknown>,
        );

        // The Yandex authorization code is single-use. Do not keep it in a URL
        // that can be refreshed while the rest of the sign-in flow completes.
        window.history.replaceState(window.history.state, "", route.path);

        const tokenPayload = decodeAuthToken(token);
        if (!tokenPayload.actor_id) {
            const email = tokenPayload.user_metadata?.email;
            if (!email) {
                throw new Error("Яндекс ID не вернул email пользователя.");
            }

            await client.store.customer.create({
                email,
                first_name: tokenPayload.user_metadata?.first_name,
                last_name: tokenPayload.user_metadata?.last_name,
            });
            await client.auth.refresh();
        }

        const customer = await authStore.restoreSession();
        if (!customer) throw new Error("Не удалось получить данные профиля.");

        await navigateTo("/");
    } catch (error) {
        message.value = getCallbackErrorMessage(error);
        console.error("Yandex ID callback failed", error);
    } finally {
        isCompleting.value = false;
    }
});
</script>

<template>
    <main class="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <p class="text-sm text-black/60">{{ message }}</p>
    </main>
</template>
