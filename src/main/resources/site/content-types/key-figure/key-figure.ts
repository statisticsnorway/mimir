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
  size?: 'small' | 'medium' | 'large';

  /**
   * Data fra spørring
   */
  dataquery?: string;

  /**
   * Forklaring til nøkkeltallet
   */
  glossaryText?: string;

  /**
   * Endringstall
   */
  changes?: Array<{
    /**
     * Benevning på endringstall
     */
    denomination?: string;
  }>;

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
