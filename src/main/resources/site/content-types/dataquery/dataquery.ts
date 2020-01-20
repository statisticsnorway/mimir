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

  /**
   * Dataset Format
   */
  datasetFormat: {
    /**
     * Formatet på resultatet etter spørring
     */
    datasetFormat: string;
  };
}
