export interface Table {
  /**
   * Rettemelding
   */
  correctionNotice?: string;

  /**
   * 
   * 				Datakilde
   * 			
   */
  dataSource?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * 
     * 						Tall fra tabellbygger
     * 					
     */
    tbprocessor?: {
      /**
       * 
       * 								URL eller TBML-id
       * 							
       */
      urlOrId?: string;
    };

    /**
     * 
     * 						Api-spørring mot statistikkbanken
     * 					
     */
    statbankApi?: {
      /**
       * 
       * 								URL eller tabell-id
       * 							
       */
      urlOrId?: string;

      /**
       * 
       * 								API-spørring mot statistikkbanken (JSON-format)
       * 							
       */
      json?: string;

      /**
       * 
       * 								Navn på x-akse dimensjon
       * 							
       */
      xAxisLabel?: string;

      /**
       * 
       * 								Navn på y-akse dimensjon
       * 							
       */
      yAxisLabel?: string;

      /**
       * 
       * 								Filtrering på dataset
       * 							
       */
      datasetFilterOptions?: {
        /**
         * Selected
         */
        _selected?: string;

        /**
         * 
         * 										Filtrer på kommune
         * 									
         */
        municipalityFilter?: {
          /**
           * 
           * 												Hvilken dimensjon skal filtreres på kommunenummer
           * 											
           */
          municipalityDimension: string;
        };
      };
    };

    /**
     * 
     * 						Lagrede spørringer mot statistikkbanken
     * 					
     */
    statbankSaved?: {
      /**
       * 
       * 								URL eller tabell-id
       * 							
       */
      urlOrId?: string;
    };

    /**
     * 
     * 						(Ikke i bruk) Ferdige dataset
     * 					
     */
    dataset?: {
      /**
       * 
       * 								ID
       * 							
       */
      id?: string;

      /**
       * 
       * 								Format
       * 							
       */
      format: "json" | "csv";
    };

    /**
     * 
     * 						Klass
     * 					
     */
    klass?: {
      /**
       * 
       * 								URL
       * 							
       */
      urlOrId?: string;
    };
  };

  /**
   * 
   * 				Kilder
   * 			
   */
  sources?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * 
     * 						Kilde fra url
     * 					
     */
    urlSource?: {
      /**
       * 
       * 								Tekst til kildelenke
       * 							
       */
      urlText: string;

      /**
       * 
       * 								Kildelenke
       * 							
       */
      url: string;
    };

    /**
     * 
     * 						Kilde fra XP
     * 					
     */
    relatedSource?: {
      /**
       * 
       * 								Tekst til kildelenke
       * 							
       */
      urlText?: string;

      /**
       * 
       * 								Relatert innhold
       * 							
       */
      sourceSelector?: string;
    };
  };
}
