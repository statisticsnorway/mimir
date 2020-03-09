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
   * Vis i kolonner
   */
  columns: boolean;

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
