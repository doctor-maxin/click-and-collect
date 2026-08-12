import type { StoreCustomer } from "@medusajs/types";
import { defineStore } from "pinia";
import { useCartStore } from "~/features/cart";
import { useCheckoutStore } from "~/features/checkout";

export type LoginCredentials = {
    email: string;
    password: string;
};

export type RegistrationCredentials = LoginCredentials & {
    firstName: string;
};

function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) return error.message;

    return "Не удалось выполнить запрос. Попробуйте ещё раз.";
}

export const useAuthStore = defineStore("auth", {
    state: () => ({
        customer: null as StoreCustomer | null,
        isOpen: false,
        isCheckingSession: false,
        isSubmitting: false,
        errorMessage: null as string | null,
    }),
    getters: {
        isAuthenticated: (state) => Boolean(state.customer),
    },
    actions: {
        setCustomer(customer: StoreCustomer | null) {
            this.customer = customer;

            if (customer) {
                useCheckoutStore().prefillRecipient({
                    email: customer.email,
                    firstName: customer.first_name ?? "",
                    lastName: customer.last_name ?? "",
                    phone: customer.phone ?? "",
                });
            }
        },
        async restoreSession() {
            this.isCheckingSession = true;

            try {
                const { customer } = await useMedusaClient().store.customer.retrieve();
                this.setCustomer(customer);
                await useCartStore().transferCartToCustomer();
                return customer;
            } catch {
                // A missing or expired token is an unauthenticated state, not an app error.
                await useMedusaClient().client.clearToken();
                this.setCustomer(null);
                return null;
            } finally {
                this.isCheckingSession = false;
            }
        },
        async open() {
            this.errorMessage = null;
            const customer = await this.restoreSession();
            this.isOpen = !customer;
        },
        close() {
            this.isOpen = false;
            this.errorMessage = null;
        },
        async login(credentials: LoginCredentials) {
            this.errorMessage = null;
            this.isSubmitting = true;

            try {
                const result = await useMedusaClient().auth.login(
                    "customer",
                    "emailpass",
                    credentials,
                );

                if (typeof result !== "string") {
                    throw new Error("Для входа требуется дополнительное подтверждение.");
                }

                const customer = await this.restoreSession();
                if (!customer) throw new Error("Не удалось получить данные профиля.");

                this.close();
            } catch (error) {
                this.errorMessage = getErrorMessage(error);
                throw error;
            } finally {
                this.isSubmitting = false;
            }
        },
        async register(credentials: RegistrationCredentials) {
            this.errorMessage = null;
            this.isSubmitting = true;

            try {
                const client = useMedusaClient();
                const registrationToken = await client.auth.register(
                    "customer",
                    "emailpass",
                    {
                        email: credentials.email,
                        password: credentials.password,
                    },
                );

                await client.store.customer.create(
                    {
                        email: credentials.email,
                        first_name: credentials.firstName,
                    },
                    {},
                    { Authorization: `Bearer ${registrationToken}` },
                );

                await this.login({
                    email: credentials.email,
                    password: credentials.password,
                });
            } catch (error) {
                this.errorMessage = getErrorMessage(error);
                throw error;
            } finally {
                this.isSubmitting = false;
            }
        },
        async startYandexLogin() {
            this.errorMessage = null;
            this.isSubmitting = true;

            try {
                const { yandexAuthProvider } = useRuntimeConfig().public;
                const result = await useMedusaClient().auth.login(
                    "customer",
                    yandexAuthProvider as string,
                    {},
                );

                if (typeof result === "string") {
                    throw new Error("Провайдер Яндекс ID вернул некорректный ответ.");
                }

                await navigateTo(result.location, { external: true });
            } catch (error) {
                this.errorMessage = getErrorMessage(error);
            } finally {
                this.isSubmitting = false;
            }
        },
        async logout() {
            await useMedusaClient().client.clearToken();
            this.setCustomer(null);
        },
    },
});
