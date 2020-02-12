export interface MenuItem {
  /**
   * Ikon
   */
  icon?: string;

  /**
   * Tittel
   */
  title: string;

  /**
   * Lenkemål
   */
  checkOptionSet?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * Url lenke
     */
    urlSource?: {
      /**
       * Kildelenke
       */
      url?: string;
    };

    /**
     * Lenke til internt innhold
     */
    relatedSource?: {
      /**
       * Relatert innhold
       */
      contentId?: string;
    };
  };
}
