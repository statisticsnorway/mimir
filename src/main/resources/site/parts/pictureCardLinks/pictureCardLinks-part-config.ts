export interface PictureCardLinksPartConfig {
  /**
   * Redaksjonell boks
   */
  pictureCardLinks: Array<{
    /**
     * Tittel
     */
    title: string;

    /**
     * Ingress
     */
    subTitle: string;

    /**
     * Lenke
     */
    href: string;

    /**
     * Bilde
     */
    image: string;
  }>;
}
