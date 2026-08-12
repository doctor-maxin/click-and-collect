<script setup lang="ts">
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
    VisuallyHidden,
} from "reka-ui";
import MainMenuBar from "./main-menu-bar.vue";

const isOpen = ref(false);
const isDesktopSubmenuOpen = ref(false);

const { data: mainMenu } = useNuxtData<NavigationMenu>("main-menu");

watch(isOpen, (isMenuOpen) => {
    if (!isMenuOpen) {
        isDesktopSubmenuOpen.value = false;
    }
});
</script>

<template>
    <DialogRoot
        v-model:open="isOpen"
        class="relative z-20"
    >
        <DialogTrigger aria-label="Открыть меню" class="cursor-pointer">
            <SvgoBurger aria-hidden="true" filled class="text-2xl" />
        </DialogTrigger>
        <DialogPortal>
            <DialogOverlay
                class="dialog-overlay fixed z-60 inset-0 bg-black/30"
            />
            <DialogContent
                class="mobile-menu-sheet fixed bottom-[calc(4.5rem_+_env(safe-area-inset-bottom,0px))] left-0 z-70 flex max-h-[calc(100dvh_-_4.5rem_-_env(safe-area-inset-bottom,0px))] w-full flex-col overflow-y-auto rounded-t-2xl bg-white p-4 sm:top-0 sm:bottom-auto sm:h-screen sm:max-h-none sm:w-auto sm:overflow-visible sm:rounded-none sm:border-r sm:border-black/20 sm:p-[4.5rem] sm:min-w-[25rem] lg:min-w-0 lg:max-w-none lg:p-0"
                :class="
                    [
                        isDesktopSubmenuOpen ? 'lg:w-[720px]' : 'lg:w-[360px]',
                    ]
                "
            >
                <div
                    class="flex h-11 w-full shrink-0 items-center justify-center sm:hidden"
                >
                    <span aria-hidden="true" class="h-1 w-10 rounded-full bg-black/15" />
                </div>
                <VisuallyHidden as-child>
                    <DialogTitle>Главное меню</DialogTitle>
                </VisuallyHidden>
                <VisuallyHidden as-child>
                    <DialogDescription>Навигация по сайту</DialogDescription>
                </VisuallyHidden>
                <div class="sm:flex-1 sm:min-h-0">
                    <MainMenuBar
                        v-if="mainMenu"
                        :menu="mainMenu"
                        @close="isOpen = false"
                        @submenu-change="isDesktopSubmenuOpen = $event"
                    />
                </div>

                <!-- <MainMenuFooter @close="isOpen = false" /> -->
                <DialogClose
                    aria-label="Закрыть меню"
                    class="hidden sm:block cursor-pointer absolute sm:top-3 sm:right-3 lg:top-8 lg:right-auto lg:left-8"
                >
                    <SvgoClose
                        aria-hidden="true"
                        filled
                        class="text-2xl mb-0!"
                    />
                </DialogClose>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>
