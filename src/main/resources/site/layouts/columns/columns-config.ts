export interface ColumnsConfig {
  /**
   * Kolonnestørrelse
   */
  size: "a" | "b" | "c";

  /**
   * Tittel
   */
  title: {
    /**
     * Tittel
     */
    title?: string;

    /**
     * Skjul tittel
     */
    hideTitle: boolean;
  };
}
