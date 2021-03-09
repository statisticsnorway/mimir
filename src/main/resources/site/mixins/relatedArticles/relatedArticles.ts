export interface RelatedArticles {
  /**
   * 
   * 						Relatert artikkel
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
}
