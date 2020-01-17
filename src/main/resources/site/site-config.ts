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
   * Standard kommune for å vise i "preview" mode
   */
  defaultMunicipality: string;
}
