export interface EndedStatisticList {
  /**
   * Statistikk
   */
  endedStatistics?: Array<{
    /**
     * Kortnavn
     */
    statistic: string;

    /**
     * Skjul statistikk fra statbank inngang
     */
    hideFromList: boolean;
  }>;
}
