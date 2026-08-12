<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/valibot";
import { useForm } from "vee-validate";
import * as v from "valibot";
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    VisuallyHidden,
} from "reka-ui";
import { useAuthStore } from "../lib/auth.store";

type AuthMode = "login" | "register";

const authStore = useAuthStore();
const mode = ref<AuthMode>("login");

const loginSchema = v.object({
    email: v.pipe(v.string(), v.trim(), v.email("Введите корректный e-mail.")),
    password: v.pipe(v.string(), v.minLength(8, "Пароль должен содержать минимум 8 символов.")),
    consent: v.pipe(v.boolean(), v.check(Boolean, "Необходимо согласие на обработку данных.")),
});
const registrationSchema = v.object({
    firstName: v.pipe(v.string(), v.trim(), v.minLength(2, "Введите имя.")),
    email: v.pipe(v.string(), v.trim(), v.email("Введите корректный e-mail.")),
    password: v.pipe(v.string(), v.minLength(8, "Пароль должен содержать минимум 8 символов.")),
    consent: v.pipe(v.boolean(), v.check(Boolean, "Необходимо согласие на обработку данных.")),
});

const loginForm = useForm({
    validationSchema: toTypedSchema(loginSchema),
    initialValues: { email: "", password: "", consent: false },
});
const registrationForm = useForm({
    validationSchema: toTypedSchema(registrationSchema),
    initialValues: { firstName: "", email: "", password: "", consent: false },
});

const submitLogin = loginForm.handleSubmit(async ({ email, password }) => {
    await authStore.login({ email, password });
});
const submitRegistration = registrationForm.handleSubmit(
    async ({ firstName, email, password }) => {
        await authStore.register({ firstName, email, password });
    },
);

function setMode(nextMode: AuthMode) {
    mode.value = nextMode;
    authStore.errorMessage = null;
}

function setOpen(isOpen: boolean) {
    if (isOpen) {
        authStore.isOpen = true;
        return;
    }

    authStore.close();
}
</script>

<template>
    <DialogRoot
        :open="authStore.isOpen"
        @update:open="setOpen"
    >
        <DialogPortal>
            <DialogOverlay class="auth-drawer-overlay dialog-overlay fixed inset-0 z-[85] bg-black/35" />
            <DialogContent
                class="auth-drawer-content fixed inset-x-0 bottom-0 z-[90] flex max-h-[calc(100dvh-0.75rem)] flex-col overflow-y-auto rounded-t-2xl bg-white px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] outline-none lg:inset-y-0 lg:right-auto lg:h-screen lg:max-h-none lg:w-[28rem] lg:rounded-none lg:px-8 lg:py-8"
            >
                <div class="flex h-11 w-full shrink-0 items-center justify-center lg:hidden">
                    <span aria-hidden="true" class="h-1 w-10 rounded-full bg-black/15" />
                </div>
                <VisuallyHidden as-child>
                    <DialogTitle>Авторизация</DialogTitle>
                </VisuallyHidden>
                <VisuallyHidden as-child>
                    <DialogDescription>Вход или регистрация в личном кабинете</DialogDescription>
                </VisuallyHidden>

                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-xs uppercase tracking-[0.14em] text-black/45">Личный кабинет</p>
                        <h2 class="mt-1 text-2xl font-medium uppercase">
                            {{ mode === "login" ? "Войти" : "Регистрация" }}
                        </h2>
                    </div>
                    <DialogClose
                        type="button"
                        class="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-black/5"
                        aria-label="Закрыть авторизацию"
                    >
                        <SvgoClose aria-hidden="true" filled class="!mb-0 text-xl" />
                    </DialogClose>
                </div>

                <p class="mt-4 text-sm leading-5 text-black/60">
                    {{ mode === "login" ? "Войдите, чтобы видеть историю заказов и быстрее оформлять покупки." : "Создайте аккаунт, чтобы сохранять данные и управлять заказами." }}
                </p>

                <p v-if="authStore.errorMessage" role="alert" class="mt-5 rounded-lg bg-red/10 px-3 py-2 text-sm leading-5 text-red">
                    {{ authStore.errorMessage }}
                </p>

                <form v-if="mode === 'login'" class="mt-6 space-y-4" @submit="submitLogin">
                    <div>
                        <UiInput name="email" type="email" autocomplete="email" placeholder="E-mail" variant="outline" class="w-full !border-black !text-black" :form="loginForm" />
                        <p v-if="loginForm.errors.value.email" class="mt-1 text-xs text-red">{{ loginForm.errors.value.email }}</p>
                    </div>
                    <div>
                        <UiInput name="password" type="password" autocomplete="current-password" placeholder="Пароль" variant="outline" class="w-full !border-black !text-black" :form="loginForm" />
                        <p v-if="loginForm.errors.value.password" class="mt-1 text-xs text-red">{{ loginForm.errors.value.password }}</p>
                    </div>
                    <div>
                        <UiCheckbox name="consent" :form="loginForm">
                            <span class="text-sm">Даю согласие на <NuxtLink to="/pages/privacy-policy" class="underline">обработку персональных данных</NuxtLink></span>
                        </UiCheckbox>
                        <p v-if="loginForm.errors.value.consent" class="mt-1 text-xs text-red">{{ loginForm.errors.value.consent }}</p>
                    </div>
                    <UiButton type="submit" class="w-full uppercase" :disabled="authStore.isSubmitting">Войти</UiButton>
                    <UiButton type="button" variant="outline" class="w-full uppercase" :disabled="authStore.isSubmitting" @click="setMode('register')">Зарегистрироваться</UiButton>
                </form>

                <form v-else class="mt-6 space-y-4" @submit="submitRegistration">
                    <div>
                        <UiInput name="firstName" autocomplete="given-name" placeholder="Имя" variant="outline" class="w-full !border-black !text-black" :form="registrationForm" />
                        <p v-if="registrationForm.errors.value.firstName" class="mt-1 text-xs text-red">{{ registrationForm.errors.value.firstName }}</p>
                    </div>
                    <div>
                        <UiInput name="email" type="email" autocomplete="email" placeholder="E-mail" variant="outline" class="w-full !border-black !text-black" :form="registrationForm" />
                        <p v-if="registrationForm.errors.value.email" class="mt-1 text-xs text-red">{{ registrationForm.errors.value.email }}</p>
                    </div>
                    <div>
                        <UiInput name="password" type="password" autocomplete="new-password" placeholder="Пароль" variant="outline" class="w-full !border-black !text-black" :form="registrationForm" />
                        <p v-if="registrationForm.errors.value.password" class="mt-1 text-xs text-red">{{ registrationForm.errors.value.password }}</p>
                    </div>
                    <div>
                        <UiCheckbox name="consent" :form="registrationForm">
                            <span class="text-sm">Даю согласие на <NuxtLink to="/pages/privacy-policy" class="underline">обработку персональных данных</NuxtLink></span>
                        </UiCheckbox>
                        <p v-if="registrationForm.errors.value.consent" class="mt-1 text-xs text-red">{{ registrationForm.errors.value.consent }}</p>
                    </div>
                    <UiButton type="submit" class="w-full uppercase" :disabled="authStore.isSubmitting">Зарегистрироваться</UiButton>
                    <UiButton type="button" variant="outline" class="w-full uppercase" :disabled="authStore.isSubmitting" @click="setMode('login')">У меня уже есть аккаунт</UiButton>
                </form>

                <div class="my-6 flex items-center gap-3 text-xs uppercase text-black/40"><span class="h-px flex-1 bg-black/10" />или<span class="h-px flex-1 bg-black/10" /></div>
                <button type="button" class="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-black text-sm font-medium uppercase transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50" :disabled="authStore.isSubmitting" @click="authStore.startYandexLogin">
                    Войти с Яндекс ID
                </button>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>

<style scoped>
.auth-drawer-content[data-state="open"] {
    animation: bottomSheetIn 220ms ease-out;
}

.auth-drawer-content[data-state="closed"] {
    animation: bottomSheetOut 180ms ease-in;
}

@media (min-width: 64rem) {
    .auth-drawer-content[data-state="open"] {
        animation: sideDrawerIn 220ms ease-out;
    }

    .auth-drawer-content[data-state="closed"] {
        animation: sideDrawerOut 180ms ease-in;
    }
}
</style>
