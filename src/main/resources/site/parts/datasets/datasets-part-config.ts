export interface DatasetsPartConfig {
  /**
   * Datasett
   */
  datasetItemSet?: Array<{
    /**
     * Tittel
     */
    title?: string;

    /**
     * Bokstekst
     */
    description?: string;

    /**
     * Ikon
     */
    icon?: string;
  }>;
}
