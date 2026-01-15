<script setup lang="ts">
import { useFiltersStore } from "~/shared/lib/filters.store";
import { UiAutocomplete } from "#components";
import { useForm } from "vee-validate";
import * as yup from "yup";
import type { IFiltersForm } from "../model/filters.form";

const filtersStore = useFiltersStore();
const router = useRouter();
const route = useRoute();

const { filtersList, appliedFilters, availableFilters } =
  storeToRefs(filtersStore);

const options = computed(() => (key: string, type: "or" | "and") => {
  const list = [];
  for (const item of filtersList.value[key] ?? []) {
    if (
      availableFilters.value[key]?.some((v) => v.value === item.value) ||
      type === "or"
    ) {
      list.push(item);
    } else {
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
  }),
  keepValuesOnUnmount: true,
  initialValues: {
    ...appliedFilters.value,
    subclass: appliedFilters.value["metadata.subclass"] || [],
    ["class"]: appliedFilters.value["metadata.class"] || [],
  },
});

const handleForm = form.handleSubmit(async (values) => {
  filtersStore.setAppliedFilters(values);

  const query: Record<string, string | string[]> = {
    ...values,
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

  if (route.query.q) {
    query.q = route.query.q.toString();
  }
  router.push({
    query,
  });
  filtersStore.close();
});

const resetForm = () => {
  filtersStore.setAppliedFilters({});
  form.resetForm(
    {
      values: {
        color: [],
        size: [],
        subclass: [],
        ["class"]: [],
      },
    },
    {
      force: true,
    },
  );
  router.push({
    query: route.query.q ? { q: route.query.q.toString() } : {},
  });
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
    />
    <UiAutocomplete
      :options="options('color', 'and')"
      name="color"
      :form="form"
      placeholder="Цвет"
    />
    <UiAutocomplete
      :options="options('metadata.subclass', 'or')"
      name="subclass"
      :form="form"
      placeholder="Категория"
    />
    <div class="flex gap-3 flex-col mt-4">
      <UiButton @click="handleForm">Показать товары</UiButton>
      <UiButton variant="outline" @click="resetForm">Сбросить</UiButton>
    </div>
  </div>
</template>
