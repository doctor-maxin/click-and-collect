import { CART_STORAGE_KEY, useCartStore } from "~/features/cart";

function getCartId(value: string | null): string | null {
    if (!value) return null;

    try {
        const state = JSON.parse(value) as { cartId?: unknown };
        return typeof state.cartId === "string" ? state.cartId : null;
    } catch {
        return null;
    }
}

export default defineNuxtPlugin({
    name: "cart-sync",
    dependsOn: ["pinia-plugin-persistedstate"],
    setup() {
        const cartStore = useCartStore();

        try {
            cartStore.hydrateCartId(
                getCartId(window.localStorage.getItem(CART_STORAGE_KEY)),
            );
        } catch {
            cartStore.hydrateCartId(null);
        }

        window.addEventListener("storage", (event) => {
            if (
                event.key !== CART_STORAGE_KEY ||
                event.storageArea !== window.localStorage
            ) {
                return;
            }

            cartStore.hydrateCartId(getCartId(event.newValue));

            if (cartStore.isOpen) {
                void cartStore.restoreCart();
            }
        });
    },
});
