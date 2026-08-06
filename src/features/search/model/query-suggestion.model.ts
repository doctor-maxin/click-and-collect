export interface IQuerySuggestion {
  phrase: string;
  _formatted?: {
    phrase?: string;
  };
  categories: {
    id: string;
    name: string;
    handle: string;
  }[];
}
