export interface CategoryLinksPartConfig {
  /**
   * Lenke Metode og Documentasjon
   */
  urlMethodDocumentation?: string;

  /**
   * Category link
   */
  CategoryLinkItemSet?: Array<{
    /**
     * Lenke tittel
     */
    titleText: string;

    /**
     * Forklaringstekst
     */
    subText: string;

    /**
     * Lenkemål
     */
    href: string;
  }>;
}
