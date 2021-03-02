export interface ActiveStatisticsPartConfig {
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
      contentId?: string;
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
}
