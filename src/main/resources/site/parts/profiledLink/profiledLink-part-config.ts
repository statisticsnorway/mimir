export interface ProfiledLinkPartConfig {
  /**
   * Profilerte lenker
   */
  profiledLinkItemSet?: Array<{
    /**
     * Lenketekst
     */
    text?: string;

    /**
     * Innhold
     */
    href?: string;
  }>;
}
