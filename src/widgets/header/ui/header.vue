<script setup lang="ts">
import { FeatureMainMenu } from "~/features/main-menu";
import { FeatureSearch } from "~/features/search";
import { FeatureFavoriteCountBadge } from "~/features/favorites";
import { FeatureCartTrigger } from "~/features/cart";
import { FeatureAuthTrigger } from "~/features/auth";

const headerMenuItems = [
    { title: "Мужское", path: "/catalog/for-man" },
    { title: "Женское", path: "/catalog/for-women" },
    { title: "Мальчикам", path: "/catalog/for-boys" },
    { title: "Девочкам", path: "/catalog/for-girls" },
];

const client = useStrapiClient();
await useAsyncData(
    "main-menu",
    () =>
        client
            .single("navigation/render/main-menu?type=TREE")
            .find() as unknown as Promise<NavigationMenu>,
);
</script>
<template>
    <div
        class="sticky ui-header left-0 top-0 z-50 hidden w-full justify-center bg-white lg:flex"
    >
        <div
            class="ui-header-content container px-4 items-center text-black grid grid-cols-[1fr_auto_1fr]"
        >
            <div class="flex items-center gap-6">
                <FeatureMainMenu />
                <nav
                    aria-label="Основная навигация"
                    class="hidden lg:flex items-center gap-4"
                >
                    <NuxtLink
                        v-for="item in headerMenuItems"
                        :key="item.title"
                        :to="item.path"
                        class="text-sm uppercase transition-opacity hover:opacity-60"
                    >
                        {{ item.title }}
                    </NuxtLink>
                </nav>
            </div>

            <NuxtLink to="/" class="mx-auto" aria-label="На главную">
                <SvgoLogo
                    aria-hidden="true"
                    class="h-8 lg:h-12 mx-auto"
                    :fontControlled="false"
                />
            </NuxtLink>
            <div class="flex items-center justify-self-end gap-3">
                <FeatureSearch />
                <FeatureAuthTrigger class="size-6" />
                <FeatureCartTrigger
                    class="flex size-6 cursor-pointer items-center justify-center"
                />
                <NuxtLink
                    to="/favorites"
                    class="relative flex size-6 items-center justify-center"
                    aria-label="Избранное"
                >
                    <SvgoHeart
                        aria-hidden="true"
                        filled
                        class="mb-0! text-2xl"
                    />
                    <ClientOnly>
                        <FeatureFavoriteCountBadge />
                    </ClientOnly>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.ui-header {
    position: sticky;
    color: black;
}

.ui-header-content {
    padding-top: calc(0.5rem + env(safe-area-inset-top, 0px));
    padding-bottom: 0.5rem;
}

@media (min-width: 1024px) {
    .ui-header-content {
        padding-top: calc(1.25rem + env(safe-area-inset-top, 0px));
        padding-bottom: 1.25rem;
    }
}

body:has(.search-dialog[data-state="open"]) .ui-header {
    background-image: unset !important;
    color: black !important;
}
</style>
