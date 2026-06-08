export const SITEMAP_HOME_PAGE_QUERY = `
    query SitemapHomePage {
        homePage {
            content {
                ... on ComponentBlocksTemy {
                    items {
                        image {
                            url
                            mime
                        }
                    }
                }
                ... on ComponentBlocksSubscriptionForm {
                    bg {
                        url
                        mime
                    }
                    mobileBg {
                        url
                        mime
                    }
                }
                ... on ComponentBlocksDepartments {
                    items {
                        image {
                            url
                            mime
                        }
                    }
                }
                ... on ComponentBlocksCarousel {
                    slides {
                        media {
                            url
                            mime
                        }
                        mobileMedia {
                            url
                            mime
                        }
                    }
                }
                ... on ComponentBlocksBanners {
                    items {
                        media {
                            url
                            mime
                        }
                        mobileMedia {
                            url
                            mime
                        }
                    }
                    detailedItems {
                        media {
                            url
                            mime
                        }
                        mobileMedia {
                            url
                            mime
                        }
                    }
                }
                ... on ComponentSharedMap {
                    defaultMedia {
                        url
                        mime
                    }
                    defaultMobileMedia {
                        url
                        mime
                    }
                }
            }
        }
    }
`;
