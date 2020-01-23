export interface SiteConfig {
  /**
   * Kommunedata innhold fra api
   */
  municipalDataContentId?: string;

  /**
   * Fylkedata innhold fra api
   */
  countyDataContentId?: string;

  /**
   * Endringslister fra api
   */
  municipalChangeListContentId?: string;

  /**
   * Standard kommune for å vise i "preview" mode
   */
  defaultMunicipality: string;

  /**
   * Velg hvilken kommuner det gjelder her.
   */
  defaultMunicipality2?: string;

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
    phrases: "norwegian" | "english";

    /**
     * Dette spåkets "Hjem"-side
     */
    homePageId?: string;
  }>;
}
