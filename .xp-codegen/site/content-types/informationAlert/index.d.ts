/* eslint-disable prettier/prettier */ 
 // WARNING: This file was automatically generated by no.item.xp.codegen. You may lose your changes if you edit it.
export type InformationAlert = {
  /**
   * Tekst
   */
  message: string;

  /**
   * Sidetype
   */
  informationAlertVariations:
    | {
        /**
         * Selected
         */
        _selected: 'statistics';

        /**
         * Statistikk
         */
        statistics: {
          /**
           * Velg hvilken statistikk det gjelder her.
           */
          statisticsIds?: Array<string> | string;

          /**
           * Velg for å gjelde alle statistikker
           */
          selectAllStatistics: boolean;
        };
      }
    | {
        /**
         * Selected
         */
        _selected: 'pages';

        /**
         * Side
         */
        pages: {
          /**
           * Velg hvilken side det gjelder her.
           */
          pageIds: Array<string> | string;
        };
      }
    | {
        /**
         * Selected
         */
        _selected: 'articles';

        /**
         * Artikkel
         */
        articles: {
          /**
           * Velg hvilken artikkel det gjelder her.
           */
          articleIds: Array<string> | string;
        };
      }
    | {
        /**
         * Selected
         */
        _selected: 'statbank';

        /**
         * Statistikkbanken
         */
        statbank: {
          /**
           * Velg for å gjelde hele Statistikkbanken
           */
          selectAllStatbankPages: boolean;
        };
      };
}
