export interface IImage {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  caption: string | null;
  provider: "local" | "remote";
}

export type IMedia = IImage | IVideo;
