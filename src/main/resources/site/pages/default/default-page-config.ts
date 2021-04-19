export interface DefaultPageConfig {
  /**
   * Sidetype
   */
  pageType: "default" | "municipality" | "factPage";

  /**
   * Skjul Brødsmulesti
   */
  hide_breadcrumb: boolean;

  /**
   * Velg bakgrunnsfarge
   */
  bkg_color: "white" | "grey";

  /**
   * Hovedemne eller Delemne
   */
  subjectType?: "mainSubject" | "subSubject";

  /**
   * Emnekode
   */
  subjectCode?: string;

  /**
   * Region
   */
  regions: Array<{
    /**
     * Visningstype
     */
    view: "full" | "card" | "plainSection";

    /**
     * Region
     */
    region: "Rad_A" | "Rad_B" | "Rad_C" | "Rad_D" | "Rad_E" | "Rad_F" | "Rad_G" | "Rad_H" | "Rad_I" | "Rad_J" | "Rad_K" | "Rad_L" | "Rad_M" | "Rad_N" | "Rad_O" | "Rad_P" | "Rad_Q" | "Rad_R" | "Rad_S" | "Rad_T" | "Rad_U" | "Rad_V" | "Rad_W" | "Rad_X" | "Rad_Y" | "Rad_Z";

    /**
     * Med mørk og skrå bakgrunn
     */
    showGreyTriangle: boolean;

    /**
     * Grå bakgrunn på region
     */
    showGreyBackground: boolean;

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
