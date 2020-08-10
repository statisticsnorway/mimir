export interface Article {
  /**
   * Vis publiseringsdato
   */
  showPublishDate: boolean;

  /**
   * Ingress
   */
  ingress: string;

  /**
   * Arkiv
   */
  articleArchive?: Array<string>;

  /**
   * Artikkeltekst
   */
  articleText?: string;

  /**
   * Løpenummer
   */
  serialNumber?: string;

  /**
   * Stikktittel
   */
  introTitle?: string;

  /**
   * Forfatter
   */
  authorItemSet?: Array<{
    /**
     * Navn
     */
    name?: string;

    /**
     * E-post
     */
    email?: string;
  }>;

  /**
   * Vis tidspunkt for sist redigering
   */
  showModifiedDate?: {
    /**
     * Selected
     */
    _selected: string | Array<string>;

    /**
     * Skal det vises dato?
     */
    dateOption?: {
      /**
       * Vis klokkeslett for publisering
       */
      showModifiedTime: boolean;

      /**
       * Tidspunkt for endring
       */
      modifiedDate?: string;
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
