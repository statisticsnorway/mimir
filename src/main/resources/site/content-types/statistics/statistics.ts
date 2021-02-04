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
   * Fritekstfelt
   */
  freeTextAttachmentTablesFigures?: string;

  /**
   * Om Statistikken
   */
  aboutTheStatistics?: string;

  /**
   * Nøkkeltall
   */
  statisticsKeyFigure?: string;

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
   * Stikkord
   */
  keywords?: string;

  /**
   * Endringsdato
   */
  showModifiedDate?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * Endringsmelding
     */
    modifiedOption?: {
      /**
       * Dato og tid
       */
      lastModified?: string;

      /**
       * Endringstekst
       */
      modifiedText?: string;
    };
  };

  /**
   * Statistikk
   */
  statistic?: string;

  /**
   * Relatert statistikk
   */
  relatedStatisticsOptions?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * Statistikk fra XP
     */
    xp?: {
      /**
       * Statistikk
       */
      contentId?: Array<string>;
    };

    /**
     * Statistikk fra 4.7
     */
    cms?: {
      /**
       * Tittel
       */
      title: string;

      /**
       * Profileringstekst
       */
      profiledText: string;

      /**
       * URL
       */
      url: string;
    };
  };

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
