export interface StatisticAlert {
  /**
   * Tekst
   */
  message: string;

  /**
   * Velg hvilken statistikk det gjelder her.
   */
  statisticIds?: Array<string>;

  /**
   * Velg for å gjelde alle statistikker
   */
  selectAllStatistics: boolean;
}
