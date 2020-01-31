export interface Highchart {
  /**
   * Description
   */
  description: string;

  /**
   * Undertittel
   */
  subtitle?: string;

  /**
   * Forklaring datagrunnlag for Screen-reader (ps. ikke i bruk)
   */
  datasetExplanation?: string;

  /**
   * Graftype
   */
  graphType: "line" | "pie" | "column" | "bar" | "area" | "barNegative";

  /**
   * Antall desimalplasser som vises
   */
  numberDecimals?: "0" | "1" | "2" | "3";

  /**
   * Stabling av verdier
   */
  stacking?: "disabled" | "normal" | "percent";

  /**
   * Skjul tegnforklaringen
   */
  noLegend: boolean;

  /**
   * Plassering av tegnforklaring
   */
  legendAlign?: "right" | "center";

  /**
   * Tegnforklaring under (kun kakediagram)
   */
  pieLegend: boolean;

  /**
   * Tickinterval
   */
  tickInterval?: string;

  /**
   * Zoom i graf
   */
  zoomType?: "null" | "x" | "y" | "xy";

  /**
   * Midtstille tittel
   */
  titleCenter: boolean;

  /**
   * Kildetabell for Highcharts-figur
   */
  htmlTable?: string;

  /**
   * Bytt rader og kolonner
   */
  switchRowsAndColumns: boolean;

  /**
   * Kombinere forklaringer
   */
  combineInfo: boolean;

  /**
   * Fotnote-tekst
   */
  footnoteText?: string;

  /**
   * Kildetekst
   */
  creditsText?: string;

  /**
   * Kilde-URL
   */
  creditsHref?: string;

  /**
   * X-akse Tittel
   */
  xAxisTitle?: string;

  /**
   * X-skala
   */
  xAxisType?: "category" | "linear" | "logarithmic";

  /**
   * X-akse Minste verdi
   */
  xAxisMin?: string;

  /**
   * X-akse Største verdi
   */
  xAxisMax?: string;

  /**
   * Tillat desimaler
   */
  xAllowDecimal: boolean;

  /**
   * Skjul aksemarkører
   */
  xEnableLabel: boolean;

  /**
   * Y-akse Tittel
   */
  yAxisTitle?: string;

  /**
   * Y-skala
   */
  yAxisType?: "category" | "linear" | "logarithmic";

  /**
   * Y-akse Minste verdi
   */
  yAxisMin?: string;

  /**
   * Y-akse Største verdi
   */
  yAxisMax?: string;

  /**
   * Y-akse Tillat desimaler
   */
  yAxisAllowDecimal: boolean;

  /**
   * Spørring mot Statistikkbanken
   */
  dataquery?: string;
}
