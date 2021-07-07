export interface LinksConfig {
  /**
   * Velg lenketype
   */
  linkTypes: "tableLink" | "headerLink" | "profiledLink";

  /**
   * Tittel
   */
  title?: string;

  /**
   * Lenketekst
   */
  description?: string;

  /**
   * Url
   */
  url?: string;

  /**
   * Relatert innhold
   */
  relatedContent?: string;

  /**
   * Innhold
   */
  linkedContent?: string;

  /**
   * Lenketekst
   */
  linkText?: string;

  /**
   * Innhold
   */
  contentUrl?: string;

  /**
   * Lenketekst
   */
  text?: string;

  /**
   * Med ikon
   */
  withIcon: boolean;
}
