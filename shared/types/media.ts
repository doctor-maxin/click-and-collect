export interface IImage {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  caption: string | null;
  provider: "local" | "remote";
  ext: string;
  mime: string;
}

export interface IVideo {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  caption: string | null;
  ext: string;
  provider: "local" | "remote";
  mime: string;
}

export type IMedia = IImage | IVideo;
