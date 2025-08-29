import type { IMedia } from "#shared/types/media";

export interface ICarouselSlide {
  id: number;
  text: string;
  textHPosition: "Center" | "Left" | "Right";
  textVPosition: "Top" | "Center" | "Bottom";
  showText: boolean;
  media: IMedia;
  mobileMedia: IMedia;
}

export interface ICarouselBlock {
  id: number;
  autoplay: boolean;
  autoplayDelay: number;
  __component: "blocks.carousel";
  slides: ICarouselSlide[];
}

export type IUiBlocks = ICarouselBlock;
