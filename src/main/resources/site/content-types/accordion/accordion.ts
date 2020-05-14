export interface Accordion {
  /**
   * Trekkspill
   */
  accordions: Array<{
    /**
     * Tekst til åpne-knapp
     */
    open?: string;

    /**
     * Innhold
     */
    body?: string;

    /**
     * Underpunkt
     */
    items?: Array<{
      /**
       * Tekst til åpneknapp
       */
      title?: string;

      /**
       * Brødtekst
       */
      body?: string;
    }>;
  }>;
}
