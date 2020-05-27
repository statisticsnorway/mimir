export interface OmStatistikken {
  /**
   * Ingress
   */
  ingress: string;

  /**
   * Dokumentasjon
   */
  relevantDocumentation?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * Innhold XP
     */
    content?: {
      /**
       * Artikkel
       */
      article: string;
    };

    /**
     * Lenke til innhold
     */
    externalLink?: {
      /**
       * URL
       */
      url: string;

      /**
       * Tittel
       */
      title: string;
    };
  };

  /**
   * Definisjoner
   */
  definition?: Array<{
    /**
     * Definisjoner av viktige begrep og variabler
     */
    conceptsAndVariables?: string;

    /**
     * Standard klassifikasjoner
     */
    standardRatings?: string;
  }>;

  /**
   * Administrative opplysninger
   */
  administrativeInformation?: Array<{
    /**
     * Regionalt nivå
     */
    regionalLevel?: string;

    /**
     * Hyppighet og aktualitet
     */
    frequency?: string;

    /**
     * Internasjonal rapportering
     */
    internationalReporting?: string;

    /**
     * Lagring og anvendelse av grunnlagsmaterialet
     */
    storageAndUse?: string;
  }>;

  /**
   * Bakgrunn
   */
  background?: Array<{
    /**
     * Formål og historie
     */
    purposeAndHistory?: string;

    /**
     * Brukere og bruksområder
     */
    usersAndUse?: string;

    /**
     * Likebehandling av brukere
     */
    EqualTreatmentUsers?: string;

    /**
     * Sammenheng med annen statistikk
     */
    RelationOtherStatistics?: string;

    /**
     * Lovhjemmel
     */
    legalAuthority?: string;

    /**
     * EØS-referanse
     */
    EeaReference?: string;
  }>;

  /**
   * Produksjon
   */
  production?: Array<{
    /**
     * Omfang
     */
    scope?: string;

    /**
     * Datakilder og utvalg
     */
    dataSourcesAndSamples?: string;

    /**
     * Datainnsamling, editering og beregninger
     */
    DataCollectionEditingAndCalculations?: string;

    /**
     * Sesongjustering
     */
    seasonalAdjustment?: string;

    /**
     * Konfidensialitet
     */
    confidentiality?: string;

    /**
     * Sammenlignbarhet over tid og sted
     */
    comparability?: string;
  }>;

  /**
   * Nøyaktighet og pålitelighet
   */
  accuracyAndReliability?: Array<{
    /**
     * Feilkilder og usikkerhet
     */
    errorSources?: string;

    /**
     * Revisjon
     */
    revision?: string;
  }>;
}
