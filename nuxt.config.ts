import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["nuxt-svgo", "nuxt-swiper", "@nuxt/image", "nuxt-graphql-client"],
  alias: {
    "@": "../src",
    "@assets": "../src/app/assets",
  },
  rootDir: ".",
  srcDir: "src",
  css: ["./src/app/assets/styles/main.css"],
  ssr: true,
  image: {
    format: ["webp", "avif"],
    strapi: {
      baseURL: `${process.env.STRAPI_URL}`,
    },
  },
  components: {
    dirs: [
      {
        path: "shared/ui",
        prefix: "ui",
      },
    ],
  },
  imports: {
    dirs: ["shared/lib"],
  },
  dir: {
    app: "app",
    pages: "app/routes",
    assets: "app/assets",
    layouts: "app/layouts",
  },
  svgo: {
    autoImportPath: "app/assets/icons",
  },
  "graphql-client": {
    codegen: false,
  },
  runtimeConfig: {
    public: {
      strapiUrl: process.env.STRAPI_URL,
      strapiToken: process.env.STRAPI_TOKEN,
      GQL_HOST: process.env.STRAPI_URL + "/graphql",
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  nitro: {
    preset: "bun",
  },
});
