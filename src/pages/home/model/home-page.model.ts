import type { API } from "@strapi/client";
import type { IUiBlocks } from "~/widgets/render-blocks";

export interface IHomePage extends API.Document {
  H1: string;
  content: IUiBlocks;
}
export interface IHomePageResponse extends API.DocumentResponse<IHomePage> {}
