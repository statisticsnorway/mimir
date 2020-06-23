export interface DataSource {
  /**
   * Datakilde
   */
  dataSource?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * Api-spørring mot statbanken
     */
    statbankApi?: {
      /**
       * URL eller tabell-id
       */
      urlOrId?: string;

      /**
       * Format
       */
      format: "json" | "xml";

      /**
       * Navn på x-akse dimensjon
       */
      xAxisLabel?: string;

      /**
       * Navn på y-akse dimensjon
       */
      yAxisLabel?: string;

      /**
       * Filtrering på dataset
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
     * Tall fra tallbygger
     */
    tallbygger?: {
      /**
       * URL eller TBML-id
       */
      urlOrId?: string;
    };

    /**
     * Lagrede spørringer mot statistikkbanken
     */
    statbankSaved?: {
      /**
       * URL
       */
      url?: string;
    };

    /**
     * Ferdige dataset
     */
    dataset?: {
      /**
       * ID
       */
      id?: string;

      /**
       * Format
       */
      format: "json" | "csv";
    };

    /**
     * Klass
     */
    klass?: {
      /**
       * URL
       */
      url?: string;
    };
  };
}
