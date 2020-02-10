export interface Article {
  /**
   * Forfatter
   */
  contactSelector?: Array<string>;

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
