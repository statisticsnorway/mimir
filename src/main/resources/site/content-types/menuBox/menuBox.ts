export interface MenuBox {
  /**
   * Boks
   */
  menu?: Array<{
    /**
     * Tittel
     */
    title?: string;

    /**
     * Undertittel
     */
    subtitle?: string;

    /**
     * Bilde
     */
    image?: string;

    /**
     * Lenke
     */
    link?: string;

    /**
     * Innhold
     */
    content?: Array<string>;
  }>;
}
