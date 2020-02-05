export interface BannerPartConfig {
  /**
   * Bakgrunnsbilde
   */
  image?: string;

  /**
   * Hvor skal banneren brukes?
   */
  pageType: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * Kommunefakta
     */
    kommunefakta?: {

    };

    /**
     * Faktaside
     */
    faktaside?: {
      /**
       * Tittel på faktaside
       */
      title?: string;
    };
  };
}
