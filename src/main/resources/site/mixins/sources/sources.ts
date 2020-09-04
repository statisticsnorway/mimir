export interface Sources {
  /**
   * Kildelenke
   */
  sources?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * Url lenke
     */
    urlSource?: {
      /**
       * Tekst til kildelenke
       */
      urlText?: string;

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
       * Tekst til kildelenke
       */
      urlText?: string;

      /**
       * Relatert innhold
       */
      sourceSelector?: string;
    };
  };
}
