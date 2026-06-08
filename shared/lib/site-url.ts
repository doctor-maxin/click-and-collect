export const toAbsoluteSiteUrl = (siteUrl: string, path: string) => {
    return new URL(path, siteUrl).toString();
};
