import type { Maybe } from "#gql/default";

type SeoImageLike = {
    url?: Maybe<string>;
};

type OpenGraphLike = {
    ogTitle?: Maybe<string>;
    ogDescription?: Maybe<string>;
    ogUrl?: Maybe<string>;
    ogType?: Maybe<string>;
    ogImage?: Maybe<SeoImageLike>;
};

type SeoLike = {
    metaTitle?: Maybe<string>;
    metaDescription?: Maybe<string>;
    canonicalURL?: Maybe<string>;
    keywords?: Maybe<string>;
    metaRobots?: Maybe<string>;
    openGraph?: Maybe<OpenGraphLike>;
    metaImage?: Maybe<SeoImageLike>;
};

type SeoInput = {
    canonical: string;
    title?: string | null;
    description?: string | null;
    image?: string | null;
    robots?: string | null;
    seo?: SeoLike | null;
};

const cleanText = (value?: string | null) => value?.trim() || undefined;

const resolveAbsoluteUrl = (value: string | undefined, base: string) => {
    if (!value) return undefined;

    try {
        return new URL(value, base).toString();
    } catch {
        return value;
    }
};

export const resolveSeoMeta = (input: SeoInput) => {
    const { seo } = input;

    const canonical = cleanText(seo?.canonicalURL) || input.canonical;
    const title = cleanText(seo?.metaTitle) || cleanText(input.title);
    const description =
        cleanText(seo?.metaDescription) || cleanText(input.description);
    const ogTitle = cleanText(seo?.openGraph?.ogTitle) || title;
    const ogDescription =
        cleanText(seo?.openGraph?.ogDescription) || description;
    const ogUrl = cleanText(seo?.openGraph?.ogUrl) || canonical;
    const image =
        cleanText(seo?.openGraph?.ogImage?.url) ||
        cleanText(seo?.metaImage?.url) ||
        cleanText(input.image);
    const ogImage = resolveAbsoluteUrl(image, canonical);

    return {
        title,
        description,
        robots: cleanText(seo?.metaRobots) || cleanText(input.robots),
        keywords: cleanText(seo?.keywords),
        canonical,
        ogTitle,
        ogDescription,
        ogUrl,
        ogType: cleanText(seo?.openGraph?.ogType) || "website",
        ogImage,
    };
};

export const truncateDescription = (
    value?: string | null,
    maxLength = 155,
) => {
    const text = cleanText(value);

    if (!text) return undefined;
    if (text.length <= maxLength) return text;

    return `${text.slice(0, maxLength - 1).trimEnd()}...`;
};
