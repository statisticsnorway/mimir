export interface Language {
  code: string;
  link: string;
  phrases: object;
  alternativeLanguages: Array<AlternativeLanguages>;
  menuContentId: string;
}

interface AlternativeLanguages {
  code: string;
  title: string;
  altVersionExists: boolean;
  path: string;
}
