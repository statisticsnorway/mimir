export interface Links {
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
      title: string;

      /**
       * Lenketekst
       */
      description: string;

      /**
       * Url
       */
      href?: string;

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
      linkedContent: string;

      /**
       * Lenketekst
       */
      linkText: string;
    };

    /**
     * Profilert lenke
     */
    profiledLink?: {
      /**
       * Lenketekst
       */
      text?: string;

      /**
       * Innhold
       */
      href?: string;

      /**
       * Med ikon
       */
      withIcon: boolean;
    };
  };
}
