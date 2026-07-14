import type { IHomePageResponse } from "../model/home-page.model";

export const getHomePage = async () => {
    const { data } = await useAsyncGql("GetHomePage", {
        pagination: {
            limit: 20,
        },
    });

    return data.value.homePage;
};
