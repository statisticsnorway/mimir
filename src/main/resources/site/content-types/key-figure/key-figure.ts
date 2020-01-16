export interface KeyFigure {
  /**
   * Ikon
   */
  icon?: string;

  /**
   * Benevning
   */
  denomination?: string;

  /**
   * Standardverdi
   */
  default?: string;

  /**
   * Størrelse
   */
  size?: string;

  /**
   * Data fra spørring
   */
  dataquery?: string;

  /**
   * Forklaring til nøkkeltallet
   */
  glossary?: string;

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
