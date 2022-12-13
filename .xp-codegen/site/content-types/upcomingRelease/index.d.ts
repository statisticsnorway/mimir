/* eslint-disable prettier/prettier */ 
 // WARNING: This file was automatically generated by no.item.xp.codegen. You may lose your changes if you edit it.
export interface UpcomingRelease {
  /**
   * Publisering
   */
  nextRelease: string;

  /**
   * Publisering (ikke bruk)
   */
  date?: string;

  /**
   * Innholdstype
   */
  contentType: 'article' | 'report' | 'analysis' | 'table' | 'activity' | 'statistics';

  /**
   * Hovedemne
   */
  mainSubject: string;

  /**
   * Lenke
   */
  href?: string;

  /**
   * GraphQL name. Also used for separating unions in TypeScript
   */
  __typename?: 'mimir_UpcomingRelease_Data';
}
