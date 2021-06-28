export interface InformationAlert {
  /**
   * Tekst
   */
  message: string;

  /**
   * Sidetype
   */
  informationAlertVariations: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * Statistikk
     */
    statistics?: {
      /**
       * Velg hvilken statistikk det gjelder her.
       */
      statisticsIds?: Array<string>;

      /**
       * Velg for å gjelde alle statistikker
       */
      selectAllStatistics: boolean;
    };

    /**
     * Side
     */
    pages?: {
      /**
       * Velg hvilken side det gjelder her.
       */
      pageIds: Array<string>;
    };

    /**
     * Artikkel
     */
    articles?: {
      /**
       * Velg hvilken artikkel det gjelder her.
       */
      articleIds: Array<string>;
    };

    /**
     * Statistikkbanken
     */
    statbank?: {
      /**
       * Velg for å gjelde alle statistikkbank sider
       */
      selectAllStatbankPages: boolean;
    };
  };
}
