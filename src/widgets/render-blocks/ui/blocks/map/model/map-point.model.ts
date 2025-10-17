export type MapPoint = {
  "company-id": number;
  name: string;
  shortname: string;
  address: string;
  country: string;
  city: string;
  phone: {
    number: string;
    ext: number;
    type: string;
  };
  "add-url": string;
  "working-time": string;
  "rubric-id": number;
  inn: number;
  ogrn: number;
  coordinates: {
    lon: number;
    lat: number;
  };
};
