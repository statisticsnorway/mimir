export interface Language {
  code: string | undefined;
  link?: string | undefined;
  phrases: Phrases | string;
  alternativeLanguages?: Array<AlternativeLanguages>;
  menuContentId?: string | undefined;
  headerId?: string | undefined;
  footerId?: string | undefined;
  standardSymbolPage?: string;
}

export interface AlternativeLanguages {
  code: string;
  title: string;
  altVersionExists: boolean;
  path: string;
}
export interface Phrases {
  [key: string]: string;
}
