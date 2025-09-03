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

const isOpen = ref(false);
const isExpanded = ref();

const { data: mainMenu } = useNuxtData<NavigationMenu>("main-menu");
</script>

<template>
    <DialogRoot v-model:open="isOpen" class="relative z-20">
        <DialogTrigger class="cursor-pointer">
            <SvgoBurger filled class="text-2xl" />
        </DialogTrigger>
        <DialogPortal>
            <DialogOverlay
                class="fixed dialog-overlay z-10 inset-0 bg-black/30"
            />
            <DialogContent
                class="bg-white transition-all dialog-content top-0 left-0 fixed z-40 h-screen p-[4.5rem] w-[25rem]"
                :class="{
                    'w-[33rem]': isExpanded,
                }"
            >
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
                />
                <DialogClose class="cursor-pointer absolute top-3 right-3">
                    <SvgoClose filled class="text-2xl !mb-0" />
                </DialogClose>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>
