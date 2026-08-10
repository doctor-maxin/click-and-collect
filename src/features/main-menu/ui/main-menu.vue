<script setup lang="ts">
import {
    DialogClose,
    DialogContent,
    VisuallyHidden,
    DialogOverlay,
    DialogDescription,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "reka-ui";
import MainMenuBar from "./main-menu-bar.vue";
import MainMenuFooter from "./main-menu-footer.vue";

const isOpen = ref(false);
const isExpanded = ref();

const { data: mainMenu } = useNuxtData<NavigationMenu>("main-menu");
</script>

<template>
    <DialogRoot v-model:open="isOpen" class="relative z-20">
        <DialogTrigger aria-label="Открыть меню" class="cursor-pointer">
            <SvgoBurger aria-hidden="true" filled class="text-2xl" />
        </DialogTrigger>
        <DialogPortal>
            <DialogOverlay
                class="fixed dialog-overlay z-43 inset-0 bg-black/30"
            />
            <DialogContent
                class="bg-white flex flex-col transition-all dialog-content top-0 left-0 fixed z-45 h-screen w-full overflow-y-auto p-4 sm:w-auto sm:overflow-visible sm:p-[4.5rem] sm:min-w-[25rem]"
                :class="{
                    'sm:min-w-160': isExpanded,
                }"
            >
                <div
                    class="sm:hidden -mt-2 grid grid-cols-[1.5rem_auto_1.5rem] items-center mb-4"
                >
                    <span class="text-2xl leading-none">
                        <SvgoBurger aria-hidden="true" filled />
                    </span>
                    <NuxtLink to="/" class="mx-auto" aria-label="На главную">
                        <SvgoLogo
                            aria-hidden="true"
                            class="h-12 mx-auto"
                            :fontControlled="false"
                        />
                    </NuxtLink>
                    <DialogClose
                        aria-label="Закрыть меню"
                        class="cursor-pointer justify-self-end text-2xl leading-none"
                    >
                        <SvgoClose aria-hidden="true" filled class="mb-0!" />
                    </DialogClose>
                </div>
                <VisuallyHidden as-child>
                    <DialogTitle>Main Menu</DialogTitle>
                </VisuallyHidden>
                <VisuallyHidden as-child>
                    <DialogDescription>Main Menu</DialogDescription>
                </VisuallyHidden>
                <MainMenuBar
                    v-model="isExpanded"
                    v-if="mainMenu"
                    :menu="mainMenu"
                    @close="isOpen = false"
                />

                <!-- <MainMenuFooter @close="isOpen = false" /> -->
                <DialogClose
                    aria-label="Закрыть меню"
                    class="hidden sm:block cursor-pointer absolute sm:top-3 sm:right-3"
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
