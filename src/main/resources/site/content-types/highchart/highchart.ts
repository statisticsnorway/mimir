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
   * Høyde i prosent av bredde
   */
  heightAspectRatio?: string;

  /**
   * Vis desimaler for avlesingspunktene i diagrammet, antall:
   */
  numberDecimals?: "0" | "1" | "2" | "3";

  /**
   * Stabling av verdier
   */
  stacking?: "disabled" | "normal" | "percent";

  /**
   * Vis samlet sum for stolpe
   */
  showStackedTotal: boolean;

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
   * Skjul tittel
   */
  hideTitle: boolean;

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
   * Skjul aksemarkører
   */
  xEnableLabel: boolean;

  /**
   * Reverser X-akse
   */
  xAxisFlip: boolean;

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
   * Vis desimaler på Y-akseverdiene, antall:
   */
  yAxisDecimalPlaces?: "0" | "1" | "2";

  /**
   * Offset Y-akse tittel
   */
  yAxisOffset?: string;

  /**
   * Spørring mot Statistikkbanken
   */
  dataquery?: string;

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
       * API-spørring mot statistikkbanken (JSON-format)
       */
      json?: string;

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
     * Tall fra tabellbygger
     */
    tbprocessor?: {
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
       * URL eller tabell-id
       */
      urlOrId?: string;
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
      urlOrId?: string;
    };
  };
}
