import { defineStore } from "pinia";

export const FAVORITES_STORAGE_KEY = "storefront-favorites";

export interface FavoriteProductSnapshot {
    id: string;
    image: string | null;
    title: string | null;
    sku: string | null;
    price: number | null;
    link: string | null;
}

interface FavoriteProductImage {
    url?: string | null;
    metadata?: unknown;
}

function normalizeString(value: unknown): string | null {
    if (typeof value !== "string") return null;

    const normalizedValue = value.trim();
    return normalizedValue || null;
}

function normalizeColor(value: unknown): string | null {
    return normalizeString(value)?.toLowerCase() ?? null;
}

export function resolveFavoriteProductImage(
    images: FavoriteProductImage[] | null | undefined,
    thumbnail: string | null | undefined,
    color: unknown,
): string | null {
    const normalizedColor = normalizeColor(color);
    const colorImage = normalizedColor
        ? images?.find((image) => {
              const metadata = image.metadata as
                  | Record<string, unknown>
                  | null
                  | undefined;
              return normalizeColor(metadata?.color) === normalizedColor;
          })
        : null;

    return (
        normalizeString(colorImage?.url) ??
        normalizeString(images?.[0]?.url) ??
        normalizeString(thumbnail)
    );
}

function normalizeFavoriteProduct(value: unknown): FavoriteProductSnapshot | null {
    if (typeof value !== "object" || value === null) return null;

    const product = value as Record<string, unknown>;
    const id = normalizeString(product.id);
    if (!id) return null;

    return {
        id,
        image: normalizeString(product.image),
        title: normalizeString(product.title),
        sku: normalizeString(product.sku),
        price: typeof product.price === "number" ? product.price : null,
        link: normalizeString(product.link),
    };
}

function normalizeFavoriteProducts(value: unknown): FavoriteProductSnapshot[] {
    if (!Array.isArray(value)) return [];

    const productsById = new Map<string, FavoriteProductSnapshot>();
    for (const valueItem of value) {
        const product = normalizeFavoriteProduct(valueItem);
        if (product) productsById.set(product.id, product);
    }

    return [...productsById.values()];
}

function normalizeLegacyProductIds(value: unknown): FavoriteProductSnapshot[] {
    if (!Array.isArray(value)) return [];

    return [...new Set(value.map((id) => String(id).trim()).filter(Boolean))].map(
        (id) => ({
            id,
            image: null,
            title: null,
            sku: null,
            price: null,
            link: null,
        }),
    );
}

function persistFavoriteProducts(products: FavoriteProductSnapshot[]) {
    if (!import.meta.client) return;

    try {
        window.localStorage.setItem(
            FAVORITES_STORAGE_KEY,
            JSON.stringify({ products }),
        );
    } catch {
        // Local storage may be unavailable, for example in private browsing mode.
    }
}

export const useFavoritesStore = defineStore("favorites", {
    state: () => ({
        products: [] as FavoriteProductSnapshot[],
        isHydrated: false,
    }),
    getters: {
        productIds: (state) => state.products.map((product) => product.id),
        hasProduct: (state) => (productId: string) =>
            state.products.some((product) => product.id === productId),
    },
    actions: {
        toggleProduct(product: FavoriteProductSnapshot) {
            const normalizedProduct = normalizeFavoriteProduct(product);
            if (!normalizedProduct) return;

            this.products = this.hasProduct(normalizedProduct.id)
                ? this.products.filter((item) => item.id !== normalizedProduct.id)
                : [...this.products, normalizedProduct];
            persistFavoriteProducts(this.products);
        },
        hydrateFromStorage(value: string | null) {
            if (!value) {
                this.products = [];
                this.isHydrated = true;
                return;
            }

            try {
                const state = JSON.parse(value) as {
                    products?: unknown;
                    productIds?: unknown;
                };
                this.products = normalizeFavoriteProducts(state.products);

                if (!this.products.length) {
                    this.products = normalizeLegacyProductIds(state.productIds);
                }
            } catch {
                this.products = [];
            } finally {
                this.isHydrated = true;
            }
        },
    },
    persist: {
        key: FAVORITES_STORAGE_KEY,
        storage: piniaPluginPersistedstate.localStorage(),
        pick: ["products"],
    },
});
