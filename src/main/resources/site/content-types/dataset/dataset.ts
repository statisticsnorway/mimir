export interface Dataset {
  /**
   * Tabell
   */
  table?: string;

  /**
   * Spørring
   */
  dataquery: string;

  /**
   * Resultat fra spørring i JSON-format
   */
  json: string;
}
