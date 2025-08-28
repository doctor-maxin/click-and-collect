import { strapi } from "@strapi/client";
import { useRuntimeConfig } from "nuxt/app";

export const useStrapiClient = () => {
  const config = useRuntimeConfig();

  const client = strapi({
    baseURL: config.public.strapiUrl + "/api",
    auth: config.public.strapiToken as string,
  });

  return client;
};
