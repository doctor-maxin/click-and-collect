<script setup lang="ts">
import {
    ComboboxAnchor,
    ComboboxContent,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxRoot,
    ComboboxTrigger,
    ComboboxViewport,
    type SelectItemSelectEvent,
} from "reka-ui";
import { useField, type FormContext } from "vee-validate";
import type { IFilterValue } from "#shared/types/autocomplete.js";

const { name, form, options } = defineProps<{
    name: string;
    form?: FormContext<any, any>;
    placeholder?: string;
    options: IFilterValue[];
}>();
const emit = defineEmits<{
    (e: "applied", name: string): void;
}>();

const { handleChange, value } = useField<IFilterValue["value"][]>(
    name,
    undefined,
    {
        form,
    },
);

const isOpen = ref(false);
const query = ref("");
const model = ref<IFilterValue["value"][]>(value.value);
const isSelectAll = computed(() => model.value?.length === options?.length);

const onSelectItem = (
    _event: SelectItemSelectEvent<IFilterValue["value"]>,
) => {};

const selectAll = () => {
    if (isSelectAll.value) {
        model.value = [];
    } else {
        model.value = options.map((v) => v.value);
    }
};

const applyFilter = () => {
    handleChange(model.value);
    isOpen.value = false;
    query.value = "";
};

watch(isOpen, (open) => {
    if (!open) {
        model.value = value.value;
    }
});

watch(value, (val, oldval) => {
    if (val?.length === 0 && oldval?.length >= 0) {
        model.value = [];
    }
});

const reset = () => {
    model.value = [];
    query.value = "";
    handleChange([]);
};
</script>
<template>
    <ComboboxRoot
        multiple
        v-model="model"
        class="relative"
        v-model:open="isOpen"
        v-slot="{ open }"
    >
        <ComboboxAnchor>
            <ComboboxTrigger
                :aria-label="placeholder"
                class="py-2 ui-autocomplete cursor-pointer border rounded-lg flex w-full justify-between items-center px-4"
                :class="{
                    'rounded-b-none': open,
                    checked: !open && value?.length > 0,
                }"
            >
                <span class="flex gap-3 items-center">
                    <span class="text-base leading-5">{{ placeholder }}</span>
                    <span
                        class="ui-autocomplete-count"
                        v-if="!open && value?.length > 0"
                        >{{ value.length }}</span
                    >
                </span>
                <SvgoArrowDown
                    aria-hidden="true"
                    filled
                    v-if="open || value?.length === 0 || !value"
                    class="text-[1.5rem] !mb-0"
                    :class="{
                        'rotate-180': !open,
                    }"
                />
                <SvgoClose
                    v-if="!open && value?.length > 0"
                    aria-hidden="true"
                    filled
                    class="text-[1.5rem] !mb-0"
                    @click.stop="reset"
                />
            </ComboboxTrigger>
        </ComboboxAnchor>

        <ComboboxContent
            class="absolute py-2 px-4 z-10 w-full bg-white rounded-b-lg border-x border-b top-full"
        >
            <ComboboxViewport class="flex flex-col w-full">
                <label class="relative text-[hsla(0,0%,57%,1)]">
                    <SvgoSearch
                        aria-hidden="true"
                        filled
                        class="absolute left-0 bottom-1 text-2xl"
                    />
                    <ComboboxInput
                        v-model="query"
                        :aria-label="`Поиск: ${placeholder}`"
                        class="w-full border-b text-black placeholder:text-base placeholder:leading-5 block focus:outline-none outline-none border-[hsla(0,0%,57%,1)] py-1.5 pl-8 pr-1.5"
                        placeholder="Поиск"
                    />
                </label>

                <ComboboxGroup
                    class="flex max-h-[20rem] py-5 overflow-y-auto custom-scrollbar flex-col gap-4 w-full"
                >
                    <ComboboxItem
                        value="*"
                        class="flex mb-2.5 gap-3 items-center cursor-pointer"
                        @select.prevent="selectAll"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                            width="24"
                            height="24"
                            :class="{
                                unchecked: !isSelectAll,
                                checked: isSelectAll,
                            }"
                        >
                            <path
                                id="Vector"
                                d="M21.3333 0L2.66667 0C1.2 0 0 1.2 0 2.66667L0 21.3333C0 22.8 1.2 24 2.66667 24L21.3333 24C22.8 24 24 22.8 24 21.3333L24 2.66667C24 1.2 22.8 0 21.3333 0ZM10.28 17.72C9.76 18.24 8.92 18.24 8.4 17.72L3.61333 12.9333C3.09333 12.4133 3.09333 11.5733 3.61333 11.0533C4.13333 10.5333 4.97333 10.5333 5.49333 11.0533L9.33333 14.8933L18.5067 5.72C19.0267 5.2 19.8667 5.2 20.3867 5.72C20.9067 6.24 20.9067 7.08 20.3867 7.6L10.28 17.72Z"
                                fill="rgb(0,163,228)"
                                fill-rule="nonzero"
                            />
                        </svg>

                        <span class="text-base leading-5"> Выбрать все </span>
                    </ComboboxItem>
                    <ComboboxItem
                        v-for="option of options"
                        :value="option.value"
                        :key="option.value"
                        :disabled="option.disabled"
                        :textValue="option.label"
                        class="flex gap-3 group items-center cursor-pointer"
                        @select="onSelectItem"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                            width="24"
                            class="min-w-6 size-6 group-[[data-disabled]]:opacity-40"
                            height="24"
                        >
                            <path
                                id="Vector"
                                d="M21.3333 0L2.66667 0C1.2 0 0 1.2 0 2.66667L0 21.3333C0 22.8 1.2 24 2.66667 24L21.3333 24C22.8 24 24 22.8 24 21.3333L24 2.66667C24 1.2 22.8 0 21.3333 0ZM10.28 17.72C9.76 18.24 8.92 18.24 8.4 17.72L3.61333 12.9333C3.09333 12.4133 3.09333 11.5733 3.61333 11.0533C4.13333 10.5333 4.97333 10.5333 5.49333 11.0533L9.33333 14.8933L18.5067 5.72C19.0267 5.2 19.8667 5.2 20.3867 5.72C20.9067 6.24 20.9067 7.08 20.3867 7.6L10.28 17.72Z"
                                fill="rgb(0,163,228)"
                                fill-rule="nonzero"
                            />
                        </svg>

                        <span
                            class="text-base leading-5 group-[[data-disabled]]:text-light-gray"
                        >
                            {{ option.label }}
                        </span>
                    </ComboboxItem>
                </ComboboxGroup>
                <UiButton class="mb-2" @click="applyFilter">Применить</UiButton>
            </ComboboxViewport>
        </ComboboxContent>
    </ComboboxRoot>
</template>
<style lang="css">
div[data-state="unchecked"] svg:not(.checked) path,
.unchecked path {
    fill: transparent;
}
div[data-state="unchecked"] svg:not(.checked),
.unchecked {
    border: 1px solid var(--color-blue);
    border-radius: 4px;
}

.ui-autocomplete.checked {
    background-color: var(--color-blue);
    color: white;

    .ui-autocomplete-count {
        color: color-mix(in hsl, var(--color-white) 50%, transparent 50%);
    }
}
</style>
