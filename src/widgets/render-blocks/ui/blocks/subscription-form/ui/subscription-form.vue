<script setup lang="ts">
import { FeatureRenderMedia } from "~/features/render-media";
import type { ISubscriptionBlock } from "~/widgets/render-blocks";
import { useForm } from "vee-validate";
import * as yup from "yup";
import { watch } from "vue";

defineProps<{
  data: ISubscriptionBlock;
}>();

const form = useForm({
  validationSchema: yup.object().shape({
    email: yup.string().email().required(),
    acceptPrivacy: yup.boolean().required().isTrue(),
    acceptPolicy: yup.boolean().required().isTrue(),
    acceptAll: yup.boolean().optional(),
  }),
});
const { setFieldValue } = form;

watch(
  () => form.values.acceptAll,
  (value, oldValue) => {
    if (value && !oldValue) {
      setFieldValue("acceptPrivacy", true);
      setFieldValue("acceptPolicy", true);
    }
    if (!value && oldValue) {
      setFieldValue("acceptPrivacy", false);
      setFieldValue("acceptPolicy", false);
    }
  },
  {
    immediate: true,
  },
);

const handleForm = form.handleSubmit(async (values) => {
  form.resetForm();
});
</script>
<template>
  <section class="relative lg:h-screen">
    <FeatureRenderMedia
      :media="data.bg"
      :mobile-media="data.mobileBg"
      class="h-full !absolute w-full"
    />
    <div
      class="container relative z-10 mx-auto flex h-full items-end justify-start"
    >
      <form
        class="max-w-full lg:max-w-[41rem] flex-col bottom-0 text-white pb-4 pt-5 px-4 lg:py-12 flex"
        @submit="handleForm"
      >
        <h3
          class="mb-2 lg:mb-7 uppercase text-[1.25rem] lg:text-[2rem] font-semibold leading-6 lg:leading-10"
        >
          {{ data.header }}
        </h3>
        <p
          class="text-base lg:text-[1.5rem] font-medium leading-6 lg:leading-8 mb-3 lg:mb-12"
        >
          {{ data.text }}
        </p>
        <div
          class="flex flex-col lg:flex-row mb-2 lg:mb-9 gap-3 lg:gap-[4.25rem] justify-between items-center"
        >
          <UiInput
            aria-label="E-mail"
            placeholder="E-mail"
            type="email"
            name="email"
            variant="outline"
            class="w-full"
            :form="form"
          />
          <UiButton
            :disabled="!form.meta?.value?.valid"
            class="w-full lg:w-[16.25rem]"
            variant="secondary"
            type="submit"
            >Подписаться</UiButton
          >
        </div>
        <div class="flex flex-col gap-2">
          <UiCheckbox name="acceptPrivacy" :form="form"
            >Даю
            <NuxtLink to="/pages/privacy-policy" class="underline"
              >согласие на обработку персональных данных</NuxtLink
            ></UiCheckbox
          >
          <UiCheckbox name="acceptPolicy" :form="form"
            >Я согласен с
            <NuxtLink to="/pages/privacy-policy" class="underline"
              >политикой конфиденциальности</NuxtLink
            ></UiCheckbox
          >
          <UiCheckbox :form="form" name="acceptAll">Выбрать все</UiCheckbox>
        </div>
      </form>
    </div>
  </section>
</template>
