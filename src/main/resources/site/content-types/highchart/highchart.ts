export interface Highchart {
  /**
   * Description
   */
  description: string;

  /**
   * Undertittel
   */
  undertittel?: string;

  /**
   * Forklaring datagrunnlag for Screen-reader (brukes nå på alle sider)
   */
  'forklaring-datagrunnlag'?: string;

  /**
   * Graftype
   */
  type?: string;

  /**
   * Antall desimalplasser som vises
   */
  numberdecimals?: string;

  /**
   * Stabling av verdier
   */
  stabling?: string;

  /**
   * Skjul tegnforklaringen
   */
  nolegend: boolean;

  /**
   * Plassering av tegnforklaring
   */
  legendAlign?: string;

  /**
   * Tegnforklaring under (kun kakediagram)
   */
  'pie-legend': boolean;

  /**
   * Tickinterval
   */
  tickinterval?: string;

  /**
   * Zoom i graf
   */
  zoomtype?: string;

  /**
   * Midtstille tittel
   */
  titleCenter: boolean;

  /**
   * Kildetabell for Highcharts-figur
   */
  htmltabell?: string;

  /**
   * Spørring mot Statistikkbanken
   */
  dataquery?: string;

  /**
   * Bytt rader og kolonner
   */
  byttraderogkolonner: boolean;

  /**
   * Kombinere forklaringer
   */
  combineInfo: boolean;

  /**
   * Fotnote-tekst
   */
  fotnoteTekst?: string;

  /**
   * Kildetekst
   */
  kildetekst?: string;

  /**
   * Kilde-URL
   */
  kildeurl?: string;

  /**
   * X-akse Tittel
   */
  xAxisTitle?: string;

  /**
   * X-skala
   */
  xAxisType?: string;

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
  xAllowDecimal?: string;

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
  yAxisType?: string;

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
   * Vis stabelsum
   */
  stabelsum: boolean;
}
