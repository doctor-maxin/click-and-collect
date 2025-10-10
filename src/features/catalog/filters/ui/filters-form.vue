<script setup lang="ts">
import { useFiltersStore } from "~/shared/lib/filters.store";
import { UiAutocomplete } from "#components";
import { useForm } from "vee-validate";
import * as yup from "yup";
import type { IFiltersForm } from "../model/filters.form";

const filtersStore = useFiltersStore();
const router = useRouter();
const { filtersList, appliedFilters, availableFilters } =
  storeToRefs(filtersStore);

const options = computed(() => (key: string) => {
  const list = [];
  for (const item of filtersList.value[key] ?? []) {
    if (availableFilters.value[key]?.some((v) => v.value === item.value)) {
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
  }),
  initialValues: appliedFilters.value,
});

const handleForm = form.handleSubmit(async (values) => {
  filtersStore.setAppliedFilters(values);
  router.push({
    query: values,
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
      },
    },
    {
      force: true,
    },
  );
  router.push({
    query: {},
  });
  filtersStore.close();
};
</script>
<template>
  <div class="flex flex-col w-full gap-5">
    <UiAutocomplete
      :options="options('size')"
      name="size"
      :form="form"
      placeholder="Размер"
    />
    <UiAutocomplete
      :options="options('color')"
      name="color"
      :form="form"
      placeholder="Цвет"
    />
    <div class="flex gap-3 flex-col mt-4">
      <UiButton @click="handleForm">Показать товары</UiButton>
      <UiButton variant="outline" @click="resetForm">Сбросить</UiButton>
    </div>
  </div>
</template>
