export interface CategoryLinksPartConfig {
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

  /**
   * Metode og Dokumentasjon
   */
  methodsDocumentation?: {
    /**
     * Selected
     */
    _selected?: string;

    /**
     * Url
     */
    urlSource?: {
      /**
       * Url
       */
      url: string;
    };

    /**
     * Innhold XP
     */
    relatedSource?: {
      /**
       * Lenkemål
       */
      content?: string;
    };
  };
}
