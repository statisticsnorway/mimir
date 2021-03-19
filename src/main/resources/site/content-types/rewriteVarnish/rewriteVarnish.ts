export interface RewriteVarnish {
  /**
   * Lenker
   */
  requests?: Array<{
    /**
     * Lenke XP
     */
    requestUrl: string;

    /**
     * Aktiver regel
     */
    enableRule: boolean;
  }>;
}
