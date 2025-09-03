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
  title: string;
  link: string;
  image: IMedia;
}

export interface IThematicItem {
  id: number;
  text: string;
  textColor: string | null;
  link: string;
  image: IMedia;
}

export interface ICarouselBlock {
  id: number;
  autoplay: boolean;
  autoplayDelay: number;
  __component: "blocks.carousel";
  slides: ICarouselSlide[];
}

export interface IAnnouncementBarBlock {
  id: number;
  text: string;
  isRunning: boolean;
  textColor?: string;
  link?: string;
  bgColor?: string;
  __component: "blocks.announcement-bar";
}

export interface IThematicsBlocks {
  id: number;
  __component: "blocks.temy";
  items: IThematicItem[];
}

export interface IDepartmentsBlocks {
  id: number;
  __component: "blocks.departments";
  items: IDepartmentItem[];
}

export interface IBannersBlock {
  id: number;
  __component: "blocks.banners";
  items: IBannerItem[];
  detailedItems: IBannerDetailedItem[];
}

export interface ISubscriptionBlock {
  id: number;
  __component: "blocks.subscription-form";
  text: string;
  header: string;
  bg: IMedia;
  mobileBg: IMedia;
}

export type IUiBlocks = Array<
  | ICarouselBlock
  | IAnnouncementBarBlock
  | IThematicsBlocks
  | IDepartmentsBlocks
  | IBannersBlock
>;
