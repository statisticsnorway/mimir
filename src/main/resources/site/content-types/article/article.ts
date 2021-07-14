export interface Article {
  /**
   * 
   * 						Stikktittel
   * 					
   */
  introTitle?: string;

  /**
   * 
   * 						Vis publiseringsdato
   * 					
   */
  showPublishDate: boolean;

  /**
   * 
   * 						Endringsdato
   * 					
   */
  showModifiedDate?: {
    /**
     * Selected
     */
    _selected: string | Array<string>;

    /**
     * 
     * 								Skal det vises dato?
     * 							
     */
    dateOption?: {
      /**
       * 
       * 										Vis klokkeslett for publisering
       * 									
       */
      showModifiedTime: boolean;

      /**
       * 
       * 										Tidspunkt for endring
       * 									
       */
      modifiedDate?: string;
    };
  };

  /**
   * 
   * 						Forfattere
   * 					
   */
  authorItemSet?: Array<{
    /**
     * 
     * 								Navn
     * 							
     */
    name?: string;

    /**
     * 
     * 								E-post
     * 							
     */
    email?: string;
  }>;

  /**
   * 
   * 						Ingress
   * 					
   */
  ingress?: string;

  /**
   * 
   * 						Artikkeltekst
   * 					
   */
  articleText?: string;

  /**
   * 
   * 						Tilhørende statistikk
   * 					
   */
  associatedStatistics?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * 
     * 								Lenke til tilhørende statistikk (XP)
     * 							
     */
    XP?: {
      /**
       * 
       * 										Statistikk
       * 									
       */
      content?: string;
    };

    /**
     * 
     * 								Lenke til tilhørende statistikk (4.7.)
     * 							
     */
    CMS?: {
      /**
       * 
       * 										URL
       * 									
       */
      href?: string;

      /**
       * 
       * 										Tittel
       * 									
       */
      title?: string;
    };
  };

  /**
   * 
   * 						Arkiv
   * 					
   */
  articleArchive?: Array<string>;

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
   * Innhold fra XP eller lenke
   */
  statisticsItemSet?: Array<{
    /**
     * Ikon
     */
    icon?: string;

    /**
     * Innhold fra XP
     */
    contentXP?: string;

    /**
     * Tittel for lenke
     */
    title?: string;

    /**
     * Profileringstekst for lenke
     */
    profiledText?: string;

    /**
     * Lenke
     */
    href?: string;
  }>;

  /**
   * Innholdstype
   */
  articleType?: "report" | "note" | "analysis" | "economicTrends" | "discussionPaper";

  /**
   * 
   * 						Løpenummer
   * 					
   */
  serialNumber?: string;

  /**
   * 
   * 						ISBN nummer
   * 					
   */
  isbnNumber?: string;

  /**
   * Prioritert visning på forside
   */
  frontPagePriority: "0" | "1";

  /**
   * Delemner
   */
  subtopic?: string;

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
