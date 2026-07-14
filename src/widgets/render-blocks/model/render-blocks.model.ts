import type { IMedia } from "#shared/types/media";

export interface ICarouselSlide {
    id: number;
    text: string;
    textHPosition: "Center" | "Left" | "Right";
    textVPosition: "Top" | "Center" | "Bottom";
    showText: boolean;
    media: IMedia;
    mobileMedia: IMedia;
    textColor?: string;
    link?: string;
}

export interface IBannerDetailedItem {
    id: number;
    showLinkButton?: boolean;
    linkButtonText?: string;
    link?: string;
    description?: string;
    media: IMedia;
    mobileMedia: IMedia;
}

export interface IBannerItem {
    id: number;
    title: string;
    showLinkButton?: boolean;
    link?: string;
    media: IMedia;
    mobileMedia: IMedia;
}

export interface IDepartmentItem {
    id: number;
    name: string;
    link: string;
    image: IMedia;
    textColor?: string;
}

export interface IThematicItem {
    id: number;
    text: string;
    textColor: string | null;
    link: string;
    image: IMedia;
}

export interface ICarouselBlock {
    id: string;
    autoplay: boolean;
    autoplayDelay: number;
    __typename: "ComponentBlocksCarousel";
    slides: ICarouselSlide[];
}

export interface IAnnouncementBarBlock {
    id: number;
    text: string;
    isRunning: boolean;
    textColor?: string;
    link?: string;
    bgColor?: string;
    __typename: "ComponentBlocksAnnouncementBar";
}

export interface IThematicsBlocks {
    id: number;
    __typename: "ComponentBlocksTemy";
    items: IThematicItem[];
    isCarousel: boolean;
    visibleCols: number;
    autoplayDuration: number;
    autoplayDelay: number;
    mobileVisibleCols: number;
}

export interface IDepartmentsBlocks {
    id: number;
    __typename: "ComponentBlocksDepartments";
    items: IDepartmentItem[];
    isCarousel: boolean;
    visibleCols: number;
    autoplayDuration: number;
    autoplayDelay: number;
    mobileVisibleCols: number;
}

export interface IBannersBlock {
    id: number;
    __typename: "ComponentBlocksBanners";
    items: IBannerItem[];
    detailedItems: IBannerDetailedItem[];
}

export interface ISubscriptionBlock {
    id: number;
    __typename: "ComponentBlocksSubscriptionForm";
    text: string;
    header: string;
    bg: IMedia;
    mobileBg: IMedia;
}

export interface ISharedMap {
    id: number;
    __typename: "ComponentSharedMap";
    header: string;
    defaultMedia: IMedia;
    defaultMobileMedia: IMedia;
}

export interface IProductsBlock {
    id: number;
    __typename: "ComponentBlocksProducts";
    title?: string | null;
    productIds: string[];
}

export interface IProductCategoryProductsItem {
    id: number;
    title?: string | null;
    categoryId?: string | null;
    productIds: string[];
}

export interface IProductCategoriesBlock {
    id: number;
    __typename: "ComponentBlocksProductCategories";
    categories: IProductCategoryProductsItem[];
}

export type IUiBlock =
    | ICarouselBlock
    | IAnnouncementBarBlock
    | IThematicsBlocks
    | IDepartmentsBlocks
    | IBannersBlock
    | ISubscriptionBlock
    | IProductsBlock
    | IProductCategoriesBlock
    | ISharedMap;
export type IUiBlocks = Array<IUiBlock>;
