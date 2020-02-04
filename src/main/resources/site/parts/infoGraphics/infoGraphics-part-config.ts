export interface InfoGraphicsPartConfig {
  /**
   * Tittel på visualinseringen
   */
  title: string;

  /**
   * Infografikk eller visualisering
   */
  image: string;

  /**
   * Fotnote til bilde
   */
  footNote?: string;

  /**
   * Alternativ tekst til bilde
   */
  altText: string;

  /**
   * Beskrivende hjelpetekst for blinde
   */
  longDesc?: string;

  /**
   * Kildelenke
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
