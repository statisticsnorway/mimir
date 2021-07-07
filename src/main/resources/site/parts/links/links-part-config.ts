export interface LinksPartConfig {
  /**
   * Lenke type
   */
  linkTypes?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * Tabell lenke
     */
    tableLink?: {
      /**
       * Tittel
       */
      title?: string;

      /**
       * Lenketekst
       */
      description?: string;

      /**
       * Url
       */
      url?: string;

      /**
       * Relatert innhold
       */
      relatedContent?: string;
    };

    /**
     * Uthevet lenke
     */
    headerLink?: {
      /**
       * Innhold
       */
      linkedContent?: string;

      /**
       * Lenketekst
       */
      linkText?: string;
    };

    /**
     * Profilert lenke
     */
    profiledLink?: {
      /**
       * Innhold
       */
      contentUrl?: string;

      /**
       * Lenketekst
       */
      text?: string;

      /**
       * Med ikon
       */
      withIcon: boolean;
    };
  };
}
