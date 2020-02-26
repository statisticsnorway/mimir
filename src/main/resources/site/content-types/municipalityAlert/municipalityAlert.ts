export interface MunicipalityAlert {
  /**
   * Tekst
   */
  message: string;

  /**
   * Velg hvilken kommuner det gjelder her.
   */
  municipalCodes?: string;
}
