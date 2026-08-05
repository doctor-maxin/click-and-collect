import { defineStore } from "pinia";

export const FAVORITES_STORAGE_KEY = "storefront-favorites";

function normalizeProductIds(value: unknown): string[] {
    if (!Array.isArray(value)) return [];

    return [...new Set(value.map((id) => String(id).trim()).filter(Boolean))];
}

function persistProductIds(productIds: string[]) {
    if (!import.meta.client) return;

    try {
        window.localStorage.setItem(
            FAVORITES_STORAGE_KEY,
            JSON.stringify({ productIds }),
        );
    } catch {
        // Local storage may be unavailable, for example in private browsing mode.
    }
}

export const useFavoritesStore = defineStore("favorites", {
    state: () => ({
        productIds: [] as string[],
        isHydrated: false,
    }),
    getters: {
        hasProduct: (state) => (productId: string) =>
            state.productIds.includes(productId),
    },
    actions: {
        toggleProduct(productId: string) {
            const id = productId.trim();
            if (!id) return;

            this.productIds = this.hasProduct(id)
                ? this.productIds.filter((item) => item !== id)
                : [...this.productIds, id];
            persistProductIds(this.productIds);
        },
        hydrateFromStorage(value: string | null) {
            if (!value) {
                this.productIds = [];
                this.isHydrated = true;
                return;
            }

            try {
                const state = JSON.parse(value) as { productIds?: unknown };
                this.productIds = normalizeProductIds(state.productIds);
            } catch {
                this.productIds = [];
            } finally {
                this.isHydrated = true;
            }
        },
    },
    persist: {
        key: FAVORITES_STORAGE_KEY,
        storage: piniaPluginPersistedstate.localStorage(),
        pick: ["productIds"],
    },
});
