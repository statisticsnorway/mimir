export interface SiteConfig {
  /**
   * Søkeresultat side
   */
  searchResultPageId?: string;

  /**
   * Topp lenker
   */
  topLinks?: Array<{
    /**
     * Lenketittel
     */
    linkTitle: string;

    /**
     * Lenkemål
     */
    urlSrc?: {
      /**
       * Selected
       */
      _selected: string;

      /**
       * Url lenke
       */
      manual?: {
        /**
         * Kildelenke
         */
        url?: string;
      };

      /**
       * Lenke til internt innhold
       */
      content?: {
        /**
         * Relatert innhold
         */
        contentId?: string;
      };
    };
  }>;

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
   * Kommunefakta instillinger
   */
  kommunefakta?: Array<{
    /**
     * Mappe kartfiler
     */
    mapfolder?: string;
  }>;

  /**
   * Routing
   */
  router?: Array<{
    /**
     * Fra
     */
    source: string;

    /**
     * Til
     */
    target: string;

    /**
     * Sidetittel på rutede sider
     */
    pageTitle?: string;
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
     * Meny
     */
    menuContentId: string;
  }>;
}
