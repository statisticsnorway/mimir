export interface StandardCardsList {
  /**
   * Tittel
   */
  title?: string;

  /**
   * Innhold
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
     * Tittel
     */
    title?: string;

    /**
     * Profileringstekst
     */
    profiledText?: string;

    /**
     * Lenke
     */
    href?: string;
  }>;
}
