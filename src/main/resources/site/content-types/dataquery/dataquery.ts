export interface Dataquery {
  /**
   * URL til tabell
   */
  table?: string;

  /**
   * Regionstype (ikke i bruk - evaluere behov)
   */
  regiontype?: string;

  /**
   * Spørring i JSON-format
   */
  json?: string;

  /**
   * Oppdateres
   */
  update?: string;
}
