export interface Statistics {
  /**
   * Tabell
   */
  mainTable?: string;

  /**
   * Vedleggstabell eller figur
   */
  attachmentTablesFigures?: Array<string>;

  /**
   * Om Statistikken
   */
  aboutTheStatistics?: string;

  /**
   * Antall tabeller i statbank
   */
  linkNumber?: string;

  /**
   * Statbank lenker
   */
  statbankLinkItemSet?: Array<{
    /**
     * Lenketekst
     */
    urlText: string;

    /**
     * URL
     */
    url: string;
  }>;

  /**
   * Statistikk
   */
  statistic?: string;

  /**
   * Relaterte statistikker
   */
  relatedStatistics?: Array<string>;

  /**
   * Relaterte eksterne lenker
   */
  relatedExternalLinkItemSet?: Array<{
    /**
     * Lenketekst
     */
    urlText: string;

    /**
     * URL
     */
    url: string;
  }>;

  /**
   * Relatert artikkel
   */
  relatedArticles?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * Artikkel
     */
    article?: {
      /**
       * Artikkel
       */
      article: string;
    };

    /**
     * Artikkel fra CMS
     */
    externalArticle?: {
      /**
       * URL
       */
      url: string;

      /**
       * Tittel
       */
      title: string;

      /**
       * Type
       */
      type?: string;

      /**
       * Dato
       */
      date?: string;

      /**
       * Ingress
       */
      preface: string;

      /**
       * Bilde
       */
      image: string;
    };
  };

  /**
   * Faktasider
   */
  relatedFactPages?: Array<string>;

  /**
   * Kontakter
   */
  contacts?: string;
}
