export interface RelatedStatistics {
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
   * Innhold fra XP eller lenke
   */
  statisticsItemSet?: Array<{
    /**
     * Ikon
     */
    icon?: string;

    /**
     * Innhold fra XP
     */
    contentXP?: string;

    /**
     * Tittel for lenke
     */
    title?: string;

    /**
     * Profileringstekst for lenke
     */
    profiledText?: string;

    /**
     * Lenke
     */
    href?: string;
  }>;
}
