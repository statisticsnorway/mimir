export interface PictureCardLinksPartConfig {
  /**
   * Redaksjonell boks
   */
  pictureCardLink: Array<{
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
