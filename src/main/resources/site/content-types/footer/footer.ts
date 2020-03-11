export interface Footer {
  /**
   * Footer Menypunkter
   */
  footerContentId?: string;

  /**
   * Lenke Copyright
   */
  copyrightUrl: string;

  /**
   * Bunn lenker
   */
  globalLinks?: Array<{
    /**
     * Lenketittel
     */
    linkTitle: string;

    /**
     * Lenkemål
     */
    urlSrc?: {
      /**
       * Selected
       */
      _selected: string;

      /**
       * Url lenke
       */
      manual?: {
        /**
         * Kildelenke
         */
        url?: string;
      };

      /**
       * Lenke til internt innhold
       */
      content?: {
        /**
         * Relatert innhold
         */
        contentId?: string;
      };
    };
  }>;

  /**
   * Lenke Facebook
   */
  facebookUrl: string;

  /**
   * Lenke Twitter
   */
  twitterUrl: string;

  /**
   * Lenke Linkedin
   */
  linkedinUrl: string;

  /**
   * Lenke RSS
   */
  rssUrl: string;
}
