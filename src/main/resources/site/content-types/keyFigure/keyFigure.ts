// WARNING: This file was automatically generated by "no.item.xp.codegen". You may lose your changes if you edit it.
export interface KeyFigure {
  /**
   * Manuell verdi
   */
  manualSource?: string;

  /**
   * Benevning
   */
  denomination?: string;

  /**
   * Størrelse
   */
  size?: "small" | "medium" | "large";

  /**
   * Endringstall
   */
  changes?: {
    /**
     * Benevning på endringstall
     */
    denomination?: string;
  };

  /**
   * Vis som grønn boks
   */
  greenBox: boolean;

  /**
   * Ordforklaring
   */
  glossaryText?: string;

  /**
   * Kilde
   */
  source?: {
    /**
     * Tittel
     */
    title?: string;

    /**
     * URL
     */
    url?: string;
  };

  /**
   * Ikon
   */
  icon?: string;

  /**
   * Standardverdi
   */
  default?: string;
}
