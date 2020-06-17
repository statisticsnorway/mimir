export interface MunicipalityAlert {
  /**
   * Tekst
   */
  message: string;

  /**
   * Velg hvilken kommuner det gjelder her.
   */
  municipalCodes?: string;

  /**
   * Velg for å gjelde alle kommuner
   */
  selectAllMunicipals: boolean;
}
