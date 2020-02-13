export interface KeyFigurePartConfig {
  /**
   * Tittel
   */
  title?: string;

  /**
   * Nøkkeltall
   */
  figure?: Array<string>;

  /**
   * Kilde
   */
  source?: Array<{
    /**
     * Tittel
     */
    title?: string;

    /**
     * URL
     */
    url?: string;
  }>;
}
