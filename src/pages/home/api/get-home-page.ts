import type { IHomePageResponse } from "../model/home-page.model";

export const getHomePage = async () => {
  const client = useStrapiClient();

  return client.single("home-page").find({
    populate: {
      content: {
        on: {
          "blocks.carousel": {
            populate: {
              slides: {
                populate: {
                  media: {
                    fields: [
                      "alternativeText",
                      "caption",
                      "mime",
                      "url",
                      "provider",
                    ],
                  },
                  mobileMedia: {
                    fields: [
                      "alternativeText",
                      "caption",
                      "url",
                      "mime",
                      "provider",
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
  }) as Promise<IHomePageResponse>;
};
