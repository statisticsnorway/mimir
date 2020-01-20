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
