export interface EntryLinksPartConfig {
  /**
   * Inngang
   */
  entryLinks?: Array<{
    /**
     * Tittel
     */
    title: string;

    /**
     * URL
     */
    href: string;

    /**
     * Ikon
     */
    icon: string;
  }>;
}
