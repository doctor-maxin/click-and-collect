export const normalizeSiteLink = (
    link: string,
    siteUrl: string | undefined,
): string => {
    if (!siteUrl || (!/^https?:\/\//i.test(link) && !link.startsWith("//"))) {
        return link;
    }

    try {
        const targetUrl = new URL(link, siteUrl);
        const currentSiteUrl = new URL(siteUrl);

        if (targetUrl.hostname !== currentSiteUrl.hostname) {
            return link;
        }

        return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
    } catch {
        return link;
    }
};
