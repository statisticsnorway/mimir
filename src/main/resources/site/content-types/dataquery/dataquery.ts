export interface Dataquery {
  /**
   * URL til tabell
   */
  table?: string;

  /**
   * API-spørring mot statistikkbanken (JSON-format)
   */
  json?: string;

  /**
   * Oppdateres
   */
  update?: "daily" | "changed";

  /**
   * Formatet på resultatet etter spørring
   */
  datasetFormat: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * API-spørring mot statistikkbanken (json-stat-format)
     */
    jsonStat?: {
      /**
       * Navn på x-akse dimensjon
       */
      xAxisLabel?: string;

      /**
       * Navn på y-akse dimensjon
       */
      yAxisLabel?: string;

      /**
       * filtrering på dataset
       */
      datasetFilterOptions?: {
        /**
         * Selected
         */
        _selected?: string;

        /**
         * Filtrer på kommune
         */
        municipalityFilter?: {
          /**
           * Hvilken dimensjon skal filtreres på kommunenummer
           */
          municipalityDimension: string;
        };
      };
    };

    /**
     * Tall fra tabellbygger (tbml-format)
     */
    tbml?: {

    };

    /**
     * API-spørring mot KLASS
     */
    klass?: {

    };
  };
}
