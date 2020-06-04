export interface OmStatistikken {
  /**
   * Ingress
   */
  ingress: string;

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
    equalTreatmentUsers?: string;

    /**
     * Sammenheng med annen statistikk
     */
    relationOtherStatistics?: string;

    /**
     * Lovhjemmel
     */
    legalAuthority?: string;

    /**
     * EØS-referanse
     */
    eeaReference?: string;
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
    dataCollectionEditingAndCalculations?: string;

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

  /**
   * Relevant dokumentasjon
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
   * Om sesongjustering
   */
  aboutSeasonalAdjustment?: Array<{
    /**
     * Generelt om sesongjustering
     */
    generalInformation?: string;

    /**
     * Hvorfor sesongjusteres denne statistikken?
     */
    whySeasonallyAdjustStatistic?: string;

    /**
     * Prekorrigering
     */
    preTreatment?: string;

    /**
     * Sesongjustering
     */
    seasonalAdjustment?: string;

    /**
     * Revisjonsrutiner
     */
    auditProcedures?: string;

    /**
     * Kvalitet på sesongjustering
     */
    qualityOfSeasonalAdjustment?: string;

    /**
     * Spesielle tilfeller
     */
    specialCases?: string;

    /**
     * Publiseringsrutiner
     */
    postingProcedures?: string;

    /**
     * Relevant dokumentasjon sesongjustering
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
  }>;
}
