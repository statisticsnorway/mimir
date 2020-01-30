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
     * json-stat
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
     * tbml
     */
    tbml?: {

    };

    /**
     * klass
     */
    klass?: {

    };
  };
}
