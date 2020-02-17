export interface SiteConfig {
  /**
   * Søkeresultat side
   */
  searchResultPageId?: string;

  /**
   * Meny
   */
  menuItemId?: string;

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
     * Språktittel (brukt til lenke i header)
     */
    label: string;

    /**
     * Språkkode (f.eks. "en", "no")
     */
    code: string;

    /**
     * Språklenke: url-stien til språkets "hjemmeside"
     */
    link?: string;

    /**
     * Språk tekst/fraser
     */
    phrases: "norwegian" | "english";

    /**
     * Språkets "Hjem"-side
     */
    homePageId?: string;
  }>;
}
