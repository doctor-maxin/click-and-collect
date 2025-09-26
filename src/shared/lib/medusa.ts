import { useNuxtApp, useRuntimeConfig } from "nuxt/app";
import Medusa from "@medusajs/js-sdk";

export const useMedusaClient = (): Medusa => {
  const nuxtApp = useNuxtApp();

  const { medusaUrl, medusaToken } = useRuntimeConfig().public;

  // Create client if it is not there.
  if (!nuxtApp._medusaClient) {
    nuxtApp._medusaClient = new Medusa({
      baseUrl: medusaUrl as string,
      publishableKey: medusaToken as string,
    });
  }

  return nuxtApp._medusaClient as Medusa;
};
