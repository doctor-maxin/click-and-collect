import {
    FAVORITES_STORAGE_KEY,
    useFavoritesStore,
} from "~/features/favorites";

export default defineNuxtPlugin({
    name: "favorites-sync",
    dependsOn: ["pinia-plugin-persistedstate"],
    setup() {
        const favoritesStore = useFavoritesStore();
        favoritesStore.hydrateFromStorage(
            window.localStorage.getItem(FAVORITES_STORAGE_KEY),
        );

        window.addEventListener("storage", (event) => {
            if (
                event.key !== FAVORITES_STORAGE_KEY ||
                event.storageArea !== window.localStorage
            ) {
                return;
            }

            favoritesStore.hydrateFromStorage(event.newValue);
        });
    },
});
