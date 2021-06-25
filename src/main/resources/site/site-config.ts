export interface SiteConfig {
  /**
   * URL til hjelpeside for statistikkbanken.
   */
  statbankHelpLink: string;

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
   * Kommunefakta instillinger
   */
  kommunefakta?: Array<{
    /**
     * Mappe kartfiler
     */
    mapfolder?: string;
  }>;

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

    /**
     * Header
     */
    headerId?: string;

    /**
     * Footer
     */
    footerId?: string;

    /**
     * Standardtegn i tabeller
     */
    standardSymbolPage?: string;
  }>;
}
