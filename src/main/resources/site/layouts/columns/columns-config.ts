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
   * Tittel
   */
  title?: string;

  /**
   * Skjul tittel
   */
  hideTitle: boolean;
}
