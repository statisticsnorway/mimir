export interface Language {
  code: string;
  link: string;
  phrases: object;
  alternativeLanguages: Array<AlternativeLanguages>;
  menuContentId: string;
  headerId: string;
  footerId: string;
  standardSymbolPage?: string;
}

interface AlternativeLanguages {
  code: string;
  title: string;
  altVersionExists: boolean;
  path: string;
}
