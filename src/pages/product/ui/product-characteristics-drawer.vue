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
import { normalizeProductCharacteristicValue } from "../lib/product-characteristic-value";

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
        const value = normalizeProductCharacteristicValue(
            metadata.value[item.key],
        );
        if (!value) continue;

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
                <span class="font-medium">Характеристики</span>
                <SvgoArrowDown
                    aria-hidden="true"
                    filled
                    class="text-2xl rotate-90 mb-0!"
                />
            </button>
        </DialogTrigger>
        <DialogPortal>
            <DialogOverlay
                class="fixed inset-0 z-40 bg-black/30 side-drawer-overlay"
            />
            <DialogContent
                class="fixed inset-x-0 bottom-0 top-auto z-50 w-full max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white px-7 pb-7 pt-10 outline-none side-drawer-content right-side-drawer-content sm:left-auto sm:right-0 sm:top-0 sm:bottom-auto sm:h-screen sm:max-h-none sm:w-100 sm:rounded-none sm:py-30 sm:px-15"
            >
                <div class="mb-5 flex items-center justify-between gap-5">
                    <h2 class="text-xl font-medium">Характеристики:</h2>
                    <DialogClose
                        aria-label="Закрыть характеристики"
                        class="cursor-pointer absolute right-4 top-4 text-2xl leading-none"
                    >
                        <SvgoClose aria-hidden="true" filled class="mb-0!" />
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

                <dl v-if="characteristics.length" class="grid grid-cols-2 flex-col gap-3">
                    <template v-for="item of characteristics" :key="item.label">
                        <div
                            class="contents gap-1 text-base leading-5"
                            v-if="item.value"
                        >
                            <dt class=""> {{ item.label }}: </dt>
                            <dd class="">
                                {{ item.value }}
                            </dd>
                        </div></template
                    >
                </dl>
                <p v-else class="text-base leading-6">
                    Характеристики товара пока не добавлены.
                </p>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>
