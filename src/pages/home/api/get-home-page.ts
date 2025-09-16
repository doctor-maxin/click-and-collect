import type { IHomePageResponse } from "../model/home-page.model";

export const getHomePage = async () => {
  const { data } = await useAsyncGql("GetHomePage");

  return data.value.homePage;
};
