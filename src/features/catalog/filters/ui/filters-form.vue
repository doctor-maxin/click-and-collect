<script setup lang="ts">
import { useFiltersStore } from "~/pages/category/lib/filters.store";
import { UiAutocomplete } from "#components";
import { useForm } from "vee-validate";
import * as yup from "yup";
import type { IFiltersForm } from "../model/filters.form";

const filtersStore = useFiltersStore();
const router = useRouter();
const { filtersList } = storeToRefs(filtersStore);

const form = useForm<IFiltersForm>({
  validationSchema: yup.object({
    color: yup.array().of(yup.string()),
    size: yup.array().of(yup.string()),
  }),
});

const handleForm = form.handleSubmit(async (values) => {
  filtersStore.setAppliedFilters(values);
  router.push({
    query: values,
  });
  filtersStore.close();
});

const resetForm = () => {
  form.resetForm();
};
</script>
<template>
  <div class="flex flex-col w-full gap-5">
    <UiAutocomplete
      :options="filtersList['size'] ?? []"
      name="size"
      :form="form"
      placeholder="Размер"
    />
    <UiAutocomplete
      :options="filtersList['color'] ?? []"
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
