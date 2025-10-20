import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "nuxt-svgo",
    "nuxt-swiper",
    "vue-yandex-maps/nuxt",
    "@nuxt/image",
    "nuxt-graphql-client",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/seo",
  ],
  alias: {
    "@": "../src",
    "@assets": "../src/app/assets",
  },
  site: {
    url: process.env.NUXT_SITE_URL,
    name: process.env.NUXT_SITE_NAME,
    description: process.env.NUXT_SITE_DESCRIPTION,
    defaultLocale: process.env.NUXT_DEFAULT_LOCALE,
  },
  yandexMaps: {
    apikey: process.env.NUXT_YANDEX_API_KEY,
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
    watch: true,
    autoImport: true,
    functionPrefix: "Gql",
    documentPaths: ["src/app/queries"],
    preferGETQueries: false,
    clients: {
      default: {
        host: process.env.STRAPI_URL + "/graphql",
        codegenHeaders: {
          Authorization: "Bearer " + process.env.STRAPI_TOKEN,
        },
        retainToken: true,
        token: {
          type: "Bearer",
          name: "Authorization",
          value: process.env.STRAPI_TOKEN,
        },
      },
    },
  },
  runtimeConfig: {
    public: {
      strapiUrl: process.env.STRAPI_URL,
      strapiToken: process.env.STRAPI_TOKEN,
      medusaUrl: process.env.NUXT_MEDUSA_URL,
      medusaToken: process.env.NUXT_MEDUSA_TOKEN,
      searchApiKey: process.env.NUXT_SEARCH_API_KEY,
      searchUrl: process.env.NUXT_SEARCH_URL,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  nitro: {
    preset: "bun",
  },
});
