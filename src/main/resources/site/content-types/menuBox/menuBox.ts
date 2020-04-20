export interface MenuBox {
  /**
   * Boks
   */
  menu?: Array<{
    /**
     * Tittel
     */
    title?: string;

    /**
     * Undertittel
     */
    subtitle?: string;

    /**
     * Bilde
     */
    image?: string;

    /**
     * Lenkemål
     */
    urlSrc: {
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
        url: string;
      };

      /**
       * Lenke til internt innhold
       */
      content?: {
        /**
         * Relatert innhold
         */
        contentId: string;
      };
    };
  }>;
}
