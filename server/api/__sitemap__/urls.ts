import { defineSitemapEventHandler } from "#imports";
import { GraphQLClient } from "graphql-request";
import { joinURL } from "ufo";
import { SITEMAP_HOME_PAGE_QUERY } from "../../utils/sitemap-queries";

const MEDUSA_PAGE_SIZE = 100;
const STRAPI_PAGE_SIZE = 100;

type SitemapEntry = {
    loc: string;
    lastmod?: string;
    images?: Array<{
        loc: string;
    }>;
};

type MedusaProduct = {
    handle?: string | null;
    updated_at?: string | null;
    images?: Array<{
        url?: string | null;
    }> | null;
};

type MedusaProductsResponse = {
    products?: MedusaProduct[];
    count?: number;
    offset?: number;
    limit?: number;
};

type MedusaCategory = {
    handle?: string | null;
    updated_at?: string | null;
    category_children?: MedusaCategory[] | null;
};

type MedusaCategoriesResponse = {
    product_categories?: MedusaCategory[];
};

type StrapiPage = {
    handle?: string | null;
    publishedAt?: string | null;
};

type StrapiMedia = {
    url?: string | null;
    mime?: string | null;
};

type StrapiPagesResponse = {
    data?: {
        pages?: StrapiPage[];
    };
    errors?: Array<{ message?: string }>;
};

type StrapiHomePageResponse = {
    homePage?: {
        content?: unknown;
    } | null;
    storesPage?: {
        publishedAt?: string | null;
        map?: unknown;
    } | null;
};

const toIsoDate = (value?: string | null) => {
    if (!value) return undefined;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return undefined;

    return date.toISOString();
};

const flattenCategories = (categories: MedusaCategory[] = []) => {
    const result: MedusaCategory[] = [];

    for (const category of categories) {
        result.push(category);

        if (category.category_children?.length) {
            result.push(...flattenCategories(category.category_children));
        }
    }

    return result;
};

const dedupeEntries = (entries: SitemapEntry[]) => {
    const urls = new Map<string, SitemapEntry>();

    for (const entry of entries) {
        if (!entry.loc) continue;
        urls.set(entry.loc, entry);
    }

    return [...urls.values()];
};

const normalizeImageUrl = (value?: string | null) => {
    if (!value) return undefined;

    try {
        return new URL(value).toString();
    } catch {
        return undefined;
    }
};

const collectImageUrls = (value: unknown, urls = new Set<string>()) => {
    if (!value) return urls;

    if (Array.isArray(value)) {
        for (const item of value) {
            collectImageUrls(item, urls);
        }

        return urls;
    }

    if (typeof value !== "object") {
        return urls;
    }

    const record = value as Record<string, unknown>;
    const maybeMedia = value as StrapiMedia;

    if (
        typeof maybeMedia.url === "string" &&
        typeof maybeMedia.mime === "string" &&
        maybeMedia.mime.startsWith("image")
    ) {
        const normalizedUrl = normalizeImageUrl(maybeMedia.url);

        if (normalizedUrl) {
            urls.add(normalizedUrl);
        }
    }

    for (const nestedValue of Object.values(record)) {
        collectImageUrls(nestedValue, urls);
    }

    return urls;
};

export default defineSitemapEventHandler(async () => {
    const config = useRuntimeConfig();
    const medusaUrl = config.public.medusaUrl as string | undefined;
    const medusaToken = config.public.medusaToken as string | undefined;
    const strapiUrl = config.public.strapiUrl as string | undefined;
    const strapiToken = config.public.strapiToken as string | undefined;

    if (!medusaUrl || !medusaToken || !strapiUrl || !strapiToken) {
        console.warn(
            "[sitemap] Missing one of required runtime configs: medusaUrl, medusaToken, strapiUrl, strapiToken",
        );
        return [];
    }

    const medusaHeaders = {
        accept: "application/json",
        "x-publishable-api-key": medusaToken,
    };
    const strapiClient = new GraphQLClient(joinURL(strapiUrl, "/graphql"), {
        headers: {
            Authorization: `Bearer ${strapiToken}`,
        },
    });

    const products: SitemapEntry[] = [];
    let offset = 0;
    let total = Number.POSITIVE_INFINITY;

    while (offset < total) {
        const response = await $fetch<MedusaProductsResponse>(
            joinURL(medusaUrl, "/store/products"),
            {
                headers: medusaHeaders,
                query: {
                    fields: "handle,updated_at,images.url",
                    limit: MEDUSA_PAGE_SIZE,
                    offset,
                },
            },
        );

        const items = response.products ?? [];

        for (const product of items) {
            if (!product.handle) continue;

            products.push({
                loc: `/products/${product.handle}`,
                lastmod: toIsoDate(product.updated_at),
                images: (product.images ?? [])
                    .map((image) => normalizeImageUrl(image.url))
                    .filter((loc): loc is string => Boolean(loc))
                    .map((loc) => ({ loc })),
            });
        }

        total = response.count ?? items.length;
        offset += response.limit ?? MEDUSA_PAGE_SIZE;

        if (items.length === 0) break;
    }

    const categoriesResponse = await $fetch<MedusaCategoriesResponse>(
        joinURL(medusaUrl, "/store/product-categories"),
        {
            headers: medusaHeaders,
            query: {
                include_descendants_tree: true,
                parent_category_id: "null",
            },
        },
    );

    const categories = flattenCategories(
        categoriesResponse.product_categories ?? [],
    )
        .filter((category) => category.handle && category.handle !== "menu")
        .map((category) => ({
            loc: `/catalog/${category.handle}`,
            lastmod: toIsoDate(category.updated_at),
        }));

    let homePageResponse: StrapiHomePageResponse;

    try {
        homePageResponse = await strapiClient.request<StrapiHomePageResponse>(
            SITEMAP_HOME_PAGE_QUERY,
        );
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: "Unable to load sitemap home page from Strapi",
            cause: error,
        });
    }

    const homeImages = [
        ...collectImageUrls(homePageResponse.homePage?.content),
    ].map((loc) => ({ loc }));
    const storesImages = [
        ...collectImageUrls(homePageResponse.storesPage?.map),
    ].map((loc) => ({ loc }));

    const pages: SitemapEntry[] = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
        const response = await $fetch<StrapiPagesResponse>(
            joinURL(strapiUrl, "/graphql"),
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: `Bearer ${strapiToken}`,
                },
                body: {
                    query: `
                        query SitemapPages($page: Int!, $pageSize: Int!) {
                            pages(
                                status: PUBLISHED
                                pagination: { page: $page, pageSize: $pageSize }
                            ) {
                                handle
                                publishedAt
                            }
                        }
                    `,
                    variables: {
                        page,
                        pageSize: STRAPI_PAGE_SIZE,
                    },
                },
            },
        );

        if (response.errors?.length) {
            throw createError({
                statusCode: 500,
                statusMessage:
                    response.errors[0]?.message ??
                    "Unable to load sitemap pages from Strapi",
            });
        }

        const items = response.data?.pages ?? [];

        for (const item of items) {
            if (!item.handle) continue;

            pages.push({
                loc: `/pages/${item.handle}`,
                lastmod: toIsoDate(item.publishedAt),
            });
        }

        hasMorePages = items.length === STRAPI_PAGE_SIZE;
        page += 1;
    }

    return dedupeEntries([
        {
            loc: "/",
            images: homeImages,
        },
        ...(homePageResponse.storesPage
            ? [
                  {
                      loc: "/stores",
                      lastmod: toIsoDate(
                          homePageResponse.storesPage.publishedAt,
                      ),
                      images: storesImages,
                  },
              ]
            : []),
        ...products,
        ...categories,
        ...pages,
    ]);
});
