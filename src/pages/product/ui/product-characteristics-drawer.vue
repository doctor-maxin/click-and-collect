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
import { useProductStore } from "../lib/product-store";
import { PRODUCT_CHARACTERISTICS_MAP } from "../lib/product-characteristics-map";

type CharacteristicItem = {
    label: string;
    value: string;
};

const productStore = useProductStore();
const { product, variant } = storeToRefs(productStore);

const metadata = computed<Record<string, unknown>>(() => {
    const rawMetadata = {
        ...(product.value?.metadata ?? {}),
        ...(variant.value?.metadata ?? {}),
    } as Record<string, unknown>;

    return rawMetadata;
});

const characteristics = computed<CharacteristicItem[]>(() => {
    const list: CharacteristicItem[] = [];

    for (const item of PRODUCT_CHARACTERISTICS_MAP) {
        const rawValue = metadata.value[item.key];

        if (
            typeof rawValue !== "string" &&
            typeof rawValue !== "number" &&
            typeof rawValue !== "boolean"
        ) {
            continue;
        }

        const value = String(rawValue).trim();
        if (!value || value === "N/A") continue;

        list.push({
            label: item.label,
            value,
        });
    }

    return list;
});
</script>

<template>
    <DialogRoot>
        <DialogTrigger as-child>
            <button
                type="button"
                class="flex w-full gap-3 items-center text-xl leading-5 cursor-pointer"
            >
                <span>Характеристики</span>
                <SvgoArrowDown filled class="text-2xl rotate-90 mb-0!" />
            </button>
        </DialogTrigger>
        <DialogPortal>
            <DialogOverlay
                class="fixed inset-0 z-40 bg-black/30 side-drawer-overlay"
            />
            <DialogContent
                class="fixed inset-x-0 bottom-0 top-auto z-50 w-full max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white px-7 pb-7 pt-10 outline-none side-drawer-content sm:left-0 sm:right-auto sm:top-0 sm:bottom-auto sm:h-screen sm:max-h-none sm:w-100 sm:rounded-none sm:py-30 sm:px-15"
            >
                <div class="mb-5 flex items-center justify-between gap-5">
                    <h2 class="text-xl font-medium">Характеристики:</h2>
                    <DialogClose
                        class="cursor-pointer absolute right-4 top-4 text-2xl leading-none"
                    >
                        <SvgoClose filled class="mb-0!" />
                    </DialogClose>
                </div>

                <VisuallyHidden as-child>
                    <DialogTitle>Характеристики товара</DialogTitle>
                </VisuallyHidden>
                <VisuallyHidden as-child>
                    <DialogDescription
                        >Основные характеристики товара</DialogDescription
                    >
                </VisuallyHidden>

                <div v-if="characteristics.length" class="flex flex-col gap-3">
                    <template v-for="item of characteristics" :key="item.label">
                        <div
                            class="flex gap-1 text-base leading-5"
                            v-if="item.value"
                        >
                            <span class=""> {{ item.label }}: </span>
                            <span class="">
                                {{ item.value }}
                            </span>
                        </div></template
                    >
                </div>
                <p v-else class="text-base leading-6">
                    Характеристики товара пока не добавлены.
                </p>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>
