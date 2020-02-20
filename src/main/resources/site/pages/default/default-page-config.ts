export interface DefaultPageConfig {
  /**
   * Velg bakgrunnsfarge
   */
  bkg_color: "white" | "grey";

  /**
   * Region
   */
  regions: Array<{
    /**
     * Visningstype
     */
    view: "full" | "card";

    /**
     * Region
     */
    region: "Rad_A" | "Rad_B" | "Rad_C" | "Rad_D" | "Rad_E" | "Rad_F" | "Rad_G" | "Rad_H" | "Rad_I" | "Rad_J" | "Rad_K" | "Rad_L" | "Rad_M" | "Rad_N" | "Rad_O" | "Rad_P" | "Rad_Q" | "Rad_R" | "Rad_S" | "Rad_T";

    /**
     * Med mørk og skrå bakgrunn
     */
    showGreyTriangle: boolean;

    /**
     * Tittel
     */
    title?: string;

    /**
     * Skjul tittel
     */
    hideTitle: boolean;
  }>;
}
