export interface ListStandardCardsPartConfig {
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
