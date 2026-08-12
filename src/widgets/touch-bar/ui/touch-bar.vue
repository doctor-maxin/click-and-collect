<script setup lang="ts">
import { FeatureMainMenu } from "~/features/main-menu";
import { FeatureSearch } from "~/features/search";
import { FeatureFavoriteCountBadge } from "~/features/favorites";
import { FeatureCartTrigger } from "~/features/cart";
import { FeatureAuthTrigger } from "~/features/auth";
</script>

<template>
    <nav
        aria-label="Быстрая навигация"
        class="touch-bar fixed inset-x-0 bottom-0 z-80 grid h-[4.5rem] grid-cols-6 border-t border-black/10 bg-white px-2 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] lg:hidden"
    >
        <div class="touch-bar-item touch-bar-control">
            <FeatureMainMenu />
            <span class="sr-only">Каталог</span>
        </div>

        <div class="touch-bar-item touch-bar-control">
            <FeatureSearch />
            <span class="sr-only">Поиск</span>
        </div>

        <NuxtLink
            to="/"
            class="touch-bar-item"
            aria-label="Главная"
        >
            <SvgoLogo aria-hidden="true" class="h-5! w-auto! !mb-0" />
            <span class="sr-only">Главная</span>
        </NuxtLink>

        <NuxtLink
            to="/favorites"
            class="touch-bar-item relative"
            aria-label="Избранное"
        >
            <span class="relative flex size-6 items-center justify-center">
                <SvgoHeart aria-hidden="true" filled class="!mb-0 text-2xl" />
                <ClientOnly>
                    <FeatureFavoriteCountBadge />
                </ClientOnly>
            </span>
            <span class="sr-only">Избранное</span>
        </NuxtLink>

        <div class="touch-bar-item touch-bar-control">
            <FeatureAuthTrigger />
            <span class="sr-only">Личный кабинет</span>
        </div>

        <FeatureCartTrigger class="touch-bar-item" />
    </nav>
</template>

<style scoped>
.touch-bar {
    padding-bottom: env(safe-area-inset-bottom, 0px);
    height: calc(4.5rem + env(safe-area-inset-bottom, 0px));
}

.touch-bar-item {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: center;
    color: #171717;
}

.touch-bar-control :deep(button) {
    display: flex;
    height: 1.5rem;
    align-items: center;
    justify-content: center;
}
</style>
