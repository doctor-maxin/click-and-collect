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

const productStore = useProductStore();
const { product, variant } = storeToRefs(productStore);

const description = computed(() => {
    const variantDescription = variant.value?.metadata?.description as
        | string
        | undefined;
    const productDescription = product.value?.description;
    const metadataDescription = product.value?.metadata?.description as
        | string
        | undefined;

    return (
        variantDescription?.trim() ||
        productDescription?.trim() ||
        metadataDescription?.trim() ||
        "Описание товара пока не добавлено."
    );
});
</script>

<template>
    <DialogRoot>
        <DialogTrigger as-child>
            <button
                type="button"
                class="flex w-full gap-3 items-center text-xl leading-5 cursor-pointer"
            >
                <span>Описание</span>
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
                class="fixed inset-x-0 bottom-0 top-auto z-70 w-full max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white px-7 pb-7 pt-10 outline-none side-drawer-content sm:left-0 sm:right-auto sm:top-0 sm:bottom-auto sm:h-screen sm:max-h-none sm:w-100 sm:rounded-none sm:py-30 sm:px-7"
            >
                <div class="mb-6 flex items-center justify-between gap-5">
                    <h2 class="text-xl font-medium">Описание:</h2>
                    <DialogClose
                        aria-label="Закрыть описание"
                        class="cursor-pointer text-2xl leading-none absolute right-4 top-4"
                    >
                        <SvgoClose aria-hidden="true" filled class="mb-0!" />
                    </DialogClose>
                </div>

                <VisuallyHidden as-child>
                    <DialogTitle>Описание товара</DialogTitle>
                </VisuallyHidden>
                <VisuallyHidden as-child>
                    <DialogDescription
                        >Подробное описание товара</DialogDescription
                    >
                </VisuallyHidden>

                <div class="whitespace-pre-line text-base leading-6">
                    {{ description }}
                </div>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>
