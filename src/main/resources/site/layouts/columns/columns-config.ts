export interface ColumnsConfig {
  /**
   * Vis som grid
   */
  isGrid: boolean;

  /**
   * Kolonnestørrelse
   */
  size: "a" | "b" | "c";

  /**
   * Vis vertikal kant
   */
  verticalBorder: boolean;

  /**
   * Tittel
   */
  title?: string;

  /**
   * Skjul tittel
   */
  hideTitle: boolean;
}
