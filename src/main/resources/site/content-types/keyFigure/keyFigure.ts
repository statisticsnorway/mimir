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
  size?: "small" | "medium" | "large";

  /**
   * Data fra spørring
   */
  dataquery?: string;

  /**
   * Vis som grønn boks
   */
  greenBox: boolean;

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

  /**
   * Datakilde
   */
  dataSource?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * Api-spørring mot statistikkbanken
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
     * (Ikke i bruk) Lagrede spørringer mot statistikkbanken
     */
    statbankSaved?: {
      /**
       * URL
       */
      url?: string;
    };

    /**
     * (Ikke i bruk) Ferdige dataset
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
