import type { BlocksContent } from "vue-strapi-blocks-renderer";

export interface IPage {
  id: number;
  handle: string;
  title: string;
  content: BlocksContent;
}
