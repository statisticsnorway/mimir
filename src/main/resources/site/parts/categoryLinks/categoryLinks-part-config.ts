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
}
