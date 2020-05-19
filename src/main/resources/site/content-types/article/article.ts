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
   * Artikkeltekst
   */
  articleText?: string;

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
   * Løpenummer
   */
  serialNumber?: string;

  /**
   * Relaterte faktasider
   */
  relatedFactPagesItemSet?: Array<{
    /**
     * Seksjons tittel
     */
    title?: string;

    /**
     * Faktasider
     */
    itemList?: Array<string>;
  }>;

  /**
   * Løpenummer
   */
  serialNumber?: string;

  /**
   * Stikktittel
   */
  introTitle?: string;

  /**
   * Kontakter
   */
  contacts: string;

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
}
