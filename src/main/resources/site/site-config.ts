export interface SiteConfig {
  /**
   * URL til kommuner
   */
  municipality: string;

  /**
   * URL til fylker
   */
  county: string;

  /**
   * Kommunedata innhold fra api
   */
  municipalDataContentId?: string;

  /**
   * Fylkedata innhold fra api
   */
  countyDataContentId?: string;

  /**
   * Standard kommune for å vise i "preview" mode
   */
  defaultMunicipality: string;

  /**
   * Språk instillinger
   */
  language: Array<{
    /**
     * Språk
     */
    label: string;

    /**
     * Språkkode
     */
    code: string;

    /**
     * Språk alternativ
     */
    alternate: string;

    /**
     * Språk lenke
     */
    link?: string;

    /**
     * Språk tekst/fraser
     */
    phrases: string;
  }>;
}
