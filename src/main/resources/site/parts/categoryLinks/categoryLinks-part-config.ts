export interface CategoryLinksPartConfig {
  /**
   * Kort
   */
  CategoryLinkItemSet?: Array<{
    /**
     * Lenketittel
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
