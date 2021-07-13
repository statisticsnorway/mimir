export interface ActiveStatisticsPartConfig {
  relatedStatisticsOptions?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * Statistikk fra XP (IKKE BRUK)
     */
    xp?: {
      /**
       * Statistikk
       */
      contentId?: string;
    };

    /**
     * Statistikk fra 4.7 (IKKE BRUK)
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
   * Tittel
   */
  title?: string;

  /**
   * Innhold fra XP
   */
  contentXP?: Array<{
    /**
     * Ikon
     */
    icon?: string;

    /**
     * Innhold
     */
    content?: string;
  }>;

  /**
   * URL
   */
  manualUrl?: Array<{
    /**
     * Ikon
     */
    icon?: string;

    /**
     * Tittel
     */
    title?: string;

    /**
     * Profileringstekst
     */
    description?: string;

    /**
     * Lenke
     */
    href?: string;
  }>;
}
