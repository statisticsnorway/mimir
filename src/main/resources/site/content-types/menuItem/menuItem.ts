export interface MenuItem {
  /**
   * Ikon
   */
  icon?: string;

  /**
   * Kortnavn
   */
  shortName?: string;

  /**
   * Menymål
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
}
