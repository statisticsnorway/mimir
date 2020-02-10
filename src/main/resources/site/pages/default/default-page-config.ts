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
    regionDisplayType: "full" | "card";

    /**
     * Region
     */
    region: "row1" | "row2" | "row3" | "row4" | "row5" | "row6" | "row7" | "row8" | "row9" | "row10" | "row11" | "row12" | "row13" | "row14" | "row15";
  }>;
}
