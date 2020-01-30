export interface RelatedSubjectBlockPartConfig {
  /**
   * Bilde
   */
  image?: string;

  /**
   * Innhold
   */
  content?: string;

  /**
   * Dato
   */
  date?: string;

  /**
   * Tittel
   */
  title?: string;

  /**
   * Ingress
   */
  preamble?: string;

  /**
   * Lenke
   */
  urlContentSelector: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * URL
     */
    optionLink?: {
      /**
       * Lenke
       */
      link?: string;
    };

    /**
     * XP-innhold
     */
    optionXPContent?: {
      /**
       * Innhold i XP
       */
      xpContent?: Array<string>;
    };
  };
}
