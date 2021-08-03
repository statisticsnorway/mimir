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
