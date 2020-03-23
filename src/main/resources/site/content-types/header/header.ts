export interface Header {
  /**
   * Logo
   */
  logo: string;

  /**
   * Meny
   */
  menuContentId: string;

  /**
   * Topp lenker i meny
   */
  globalLinks?: Array<{
    /**
     * Lenketittel
     */
    linkTitle: string;

    /**
     * Lenkemål
     */
    urlSrc?: {
      /**
       * Selected
       */
      _selected: string;

      /**
       * Url lenke
       */
      manual?: {
        /**
         * Kildelenke
         */
        url?: string;
      };

      /**
       * Lenke til internt innhold
       */
      content?: {
        /**
         * Relatert innhold
         */
        contentId?: string;
      };
    };
  }>;

  /**
   * Landingsside for søk
   */
  searchResultPage?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * Url lenke
     */
    manual?: {
      /**
       * Kildelenke
       */
      url?: string;
    };

    /**
     * Lenke til internt innhold
     */
    content?: {
      /**
       * Relatert innhold
       */
      contentId?: string;
    };
  };
}
