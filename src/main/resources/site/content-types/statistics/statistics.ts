export interface Statistics {
  /**
   * Skjul statistikk fra statbank emnetre
   */
  hideFromList: boolean;

  /**
   * 
   * 						Endringsdato
   * 					
   */
  showModifiedDate?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * 
     * 								Endringsmelding
     * 							
     */
    modifiedOption?: {
      /**
       * 
       * 										Dato og tid
       * 									
       */
      lastModified?: string;

      /**
       * 
       * 										Endringstekst
       * 									
       */
      modifiedText?: string;
    };
  };

  /**
   * 
   * 						Tabell
   * 					
   */
  mainTable?: string;

  /**
   * 
   * 						Vedleggstabell eller figur
   * 					
   */
  attachmentTablesFigures?: Array<string>;

  /**
   * 
   * 						Fritekstfelt
   * 					
   */
  freeTextAttachmentTablesFigures?: string;

  /**
   * 
   * 						Om Statistikken
   * 					
   */
  aboutTheStatistics?: string;

  /**
   * 
   * 						Nøkkeltall
   * 					
   */
  statisticsKeyFigure?: string;

  /**
   * 
   * 						Antall tabeller i statbank
   * 					
   */
  linkNumber?: string;

  /**
   * 
   * 						Lenker til tabeller i statistikkbanken
   * 					
   */
  statbankLinkItemSet?: Array<{
    /**
     * 
     * 								Lenketekst
     * 							
     */
    urlText: string;

    /**
     * 
     * 								URL
     * 							
     */
    url: string;
  }>;

  /**
   * 
   * 						Stikkord
   * 					
   */
  keywords?: string;

  /**
   * Delemner
   */
  subtopic?: string;

  /**
   * Statistikk
   */
  statistic?: string;

  relatedStatisticsOptions?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * Statistikk fra XP (IKKE BRUK)
     */
    xp?: {
      /**
       * Statistikk
       */
      contentId?: string;
    };

    /**
     * Statistikk fra 4.7 (IKKE BRUK)
     */
    cms?: {
      /**
       * Tittel
       */
      title: string;

      /**
       * Profileringstekst
       */
      profiledText: string;

      /**
       * URL
       */
      url: string;
    };
  };

  /**
   * Tittel
   */
  title?: string;

  /**
   * Innhold fra XP
   */
  contentXP?: Array<{
    /**
     * Ikon
     */
    icon?: string;

    /**
     * Innhold
     */
    content?: string;
  }>;

  /**
   * URL
   */
  manualUrl?: Array<{
    /**
     * Ikon
     */
    icon?: string;

    /**
     * Tittel
     */
    title?: string;

    /**
     * Profileringstekst
     */
    description?: string;

    /**
     * Lenke
     */
    href?: string;
  }>;

  /**
   * 
   * 						Relaterte eksterne lenker
   * 					
   */
  relatedExternalLinkItemSet?: Array<{
    /**
     * 
     * 								Lenketekst
     * 							
     */
    urlText: string;

    /**
     * 
     * 								URL
     * 							
     */
    url: string;
  }>;

  /**
   * 
   * 						Relaterte artikler
   * 					
   */
  relatedArticles?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * 
     * 								Artikkel
     * 							
     */
    article?: {
      /**
       * 
       * 										Artikkel fra XP
       * 									
       */
      article: string;
    };

    /**
     * 
     * 								Artikkel fra 4.7-CMS
     * 							
     */
    externalArticle?: {
      /**
       * 
       * 										URL
       * 									
       */
      url: string;

      /**
       * 
       * 										Tittel
       * 									
       */
      title: string;

      /**
       * 
       * 										Type
       * 									
       */
      type?: string;

      /**
       * 
       * 										Dato
       * 									
       */
      date?: string;

      /**
       * 
       * 										Ingress
       * 									
       */
      preface: string;

      /**
       * 
       * 										Bilde
       * 									
       */
      image: string;
    };
  };

  /**
   * Faktasider
   */
  relatedFactPages?: Array<string>;

  /**
   * Kontakter
   */
  contacts?: string;
}
