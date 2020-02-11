export interface BannerPartConfig {
  /**
   * Bakgrunnsbilde
   */
  image?: string;

  /**
   * Hvor skal banneret brukes?
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

    /**
     * Annet
     */
    general?: {
      /**
       * Tittel
       */
      generalTitle?: string;
    };
  };
}
