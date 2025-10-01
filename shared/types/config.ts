export interface IGlobalConfig {
  config: {
    id: number;
    documentId: string;
    address: string;
    email: string;
    phone: string;
    yandexMapKey: string;
    cookieBanner: {
      header: string;
      content: string;
    };
  };
}
