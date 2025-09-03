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
                      "ext",
                    ],
                  },
                  mobileMedia: {
                    fields: [
                      "alternativeText",
                      "caption",
                      "url",
                      "mime",
                      "provider",
                      "ext",
                    ],
                  },
                },
              },
            },
          },
          "blocks.announcement-bar": {
            populate: true,
          },
          "blocks.temy": {
            populate: {
              items: {
                populate: {
                  image: {
                    fields: [
                      "alternativeText",
                      "caption",
                      "url",
                      "mime",
                      "provider",
                      "ext",
                    ],
                  },
                },
              },
            },
          },
          "blocks.departments": {
            populate: {
              items: {
                populate: {
                  image: {
                    fields: [
                      "alternativeText",
                      "caption",
                      "url",
                      "mime",
                      "provider",
                      "ext",
                    ],
                  },
                },
              },
            },
          },
          "blocks.banners": {
            populate: {
              items: {
                populate: {
                  media: {
                    fields: [
                      "alternativeText",
                      "caption",
                      "url",
                      "mime",
                      "provider",
                      "ext",
                    ],
                  },
                  mobileMedia: {
                    fields: [
                      "alternativeText",
                      "caption",
                      "url",
                      "mime",
                      "provider",
                      "ext",
                    ],
                  },
                },
              },
              detailedItems: {
                populate: {
                  media: {
                    fields: [
                      "alternativeText",
                      "caption",
                      "url",
                      "mime",
                      "provider",
                      "ext",
                    ],
                  },
                  mobileMedia: {
                    fields: [
                      "alternativeText",
                      "caption",
                      "url",
                      "mime",
                      "provider",
                      "ext",
                    ],
                  },
                },
              },
            },
          },
          "blocks.subscription-form": {
            populate: {
              bg: {
                fields: [
                  "alternativeText",
                  "caption",
                  "url",
                  "mime",
                  "provider",
                  "ext",
                ],
              },
              mobileBg: {
                fields: [
                  "alternativeText",
                  "caption",
                  "url",
                  "mime",
                  "provider",
                  "ext",
                ],
              },
            },
          },
        },
      },
    },
  }) as Promise<IHomePageResponse>;
};
