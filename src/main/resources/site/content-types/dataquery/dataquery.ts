export interface Dataquery {
  /**
   * URL til tabell
   */
  table?: string;

  /**
   * Spørring i JSON-format
   */
  json?: string;

  /**
   * Oppdateres
   */
  update?: string;
}
