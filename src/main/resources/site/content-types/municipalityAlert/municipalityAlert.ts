export interface MunicipalityAlert {
  /**
   * Tekst
   */
  message: string;

  /**
   * Velg hvilke sidetype varselet skal vises på
   */
  municipalPageType: "kommunefakta" | "kommuneareal" | "showOnAll";

  /**
   * Velg hvilken kommuner det gjelder her.
   */
  municipalCodes?: string;

  /**
   * Velg for å gjelde alle kommuner
   */
  selectAllMunicipals: boolean;
}
