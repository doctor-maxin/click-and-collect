import { Meilisearch } from "meilisearch";

export const useSearchClient = (): Meilisearch => {
  const nuxtApp = useNuxtApp();

  const { searchUrl, searchApiKey } = useRuntimeConfig()?.public;

  if (!nuxtApp._searchClient) {
    nuxtApp._searchClient = new Meilisearch({
      host: searchUrl as string,
      apiKey: searchApiKey as string,
    });
  }

  return nuxtApp._searchClient as Meilisearch;
};
