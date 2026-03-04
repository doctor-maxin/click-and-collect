<script setup lang="ts">
import { useFiltersStore } from "~/shared/lib/filters.store";
import { UiAutocomplete } from "#components";
import { UiCheckbox } from "#components";
import { useForm } from "vee-validate";
import * as yup from "yup";
import type { IFiltersForm } from "../model/filters.form";

const filtersStore = useFiltersStore();
const router = useRouter();
const route = useRoute();

const { filtersList, appliedFilters, availableFilters, lastAppliedInput } =
  storeToRefs(filtersStore);
const lastAppliedField = ref<string | null>(null);

const options = computed(() => (key: string, type: "or" | "and") => {
  const list = [];
  const isActiveInput = lastAppliedInput.value === key;
  const selectedValues = new Set(appliedFilters.value[key] ?? []);
  const availableValues = new Set(
    (availableFilters.value[key] ?? []).map((item) => item.value),
  );

  for (const item of filtersList.value[key] ?? []) {
    const isAvailable = availableValues.has(item.value);
    const isSelected = selectedValues.has(item.value);

    if (isAvailable || isSelected || isActiveInput) {
      list.push(item);
    } else if (type === "and" || type === "or") {
      list.push({
        ...item,
        disabled: true,
      });
    }
  }
  return list;
});
const form = useForm<IFiltersForm>({
  validationSchema: yup.object({
    color: yup.array().of(yup.string()),
    size: yup.array().of(yup.string()),
    ["subclass"]: yup.array().of(yup.string()),
    ["class"]: yup.array().of(yup.string()),
    is_discounted: yup.boolean().default(false),
  }),
  keepValuesOnUnmount: true,
  initialValues: {
    ...appliedFilters.value,
    subclass: appliedFilters.value["metadata.subclass"] || [],
    ["class"]: appliedFilters.value["metadata.class"] || [],
    is_discounted:
      appliedFilters.value["is_discounted"]?.includes("true") ?? false,
  },
});

const handleForm = form.handleSubmit(async (values) => {
  const previousIsDiscounted =
    appliedFilters.value["is_discounted"]?.includes("true") ?? false;

  const nextFilters: Record<string, string[]> = {
    color: values.color ?? [],
    size: values.size ?? [],
    subclass: values.subclass ?? [],
    class: values.class ?? [],
  };

  if (values.is_discounted) {
    nextFilters.is_discounted = ["true"];
  }

  filtersStore.setAppliedFilters(nextFilters, { trackLastApplied: true });
  if (lastAppliedField.value) {
    filtersStore.setLastAppliedInput(lastAppliedField.value);
  } else if (previousIsDiscounted !== values.is_discounted) {
    filtersStore.setLastAppliedInput("is_discounted");
  }

  const query: Record<string, string | string[]> = {
    ...nextFilters,
  };

  // Заменяем ключ subclass на metadata.subclass
  if (query.subclass) {
    query["metadata.subclass"] = query.subclass;
    delete query.subclass;
  }
  if (query.class) {
    query["metadata.class"] = query.class;
    delete query.class;
  }
  if (!values.is_discounted) {
    delete query.is_discounted;
  }

  if (route.query.q) {
    query.q = route.query.q.toString();
  }
  router.push({
    query,
  });
  lastAppliedField.value = null;
  filtersStore.close();
});

const resetForm = () => {
  filtersStore.setAppliedFilters({}, { trackLastApplied: false });
  filtersStore.setLastAppliedInput(null);
  form.resetForm(
    {
      values: {
        color: [],
        size: [],
        subclass: [],
        ["class"]: [],
        is_discounted: false,
      },
    },
    {
      force: true,
    },
  );
  router.push({
    query: route.query.q ? { q: route.query.q.toString() } : {},
  });
  lastAppliedField.value = null;
  filtersStore.close();
};
</script>
<template>
  <div class="flex flex-col w-full gap-5">
    <UiAutocomplete
      :options="options('size', 'and')"
      name="size"
      :form="form"
      placeholder="Размер"
      @applied="lastAppliedField = $event"
    />
    <UiAutocomplete
      :options="options('color', 'and')"
      name="color"
      :form="form"
      placeholder="Цвет"
      @applied="lastAppliedField = $event"
    />
    <UiAutocomplete
      :options="options('metadata.subclass', 'or')"
      name="subclass"
      :form="form"
      placeholder="Категория"
      @applied="lastAppliedField = $event"
    />
    <UiCheckbox name="is_discounted" :form="form">Только со скидкой</UiCheckbox>
    <div class="flex gap-3 flex-col mt-4">
      <UiButton @click="handleForm">Показать товары</UiButton>
      <UiButton variant="outline" @click="resetForm">Сбросить</UiButton>
    </div>
  </div>
</template>
