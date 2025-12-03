export interface IQuerySuggestion {
  phrase: string;
  categories: {
    id: string;
    name: string;
    handle: string;
  }[];
}
