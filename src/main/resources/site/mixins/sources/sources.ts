export interface Sources {
  /**
   * 
   * 				Kilder
   * 			
   */
  sources?: {
    /**
     * Selected
     */
    _selected: string;

    /**
     * 
     * 						Kilde fra url
     * 					
     */
    urlSource?: {
      /**
       * 
       * 								Tekst til kildelenke
       * 							
       */
      urlText: string;

      /**
       * 
       * 								Kildelenke
       * 							
       */
      url: string;
    };

    /**
     * 
     * 						Kilde fra XP
     * 					
     */
    relatedSource?: {
      /**
       * 
       * 								Tekst til kildelenke
       * 							
       */
      urlText?: string;

      /**
       * 
       * 								Relatert innhold
       * 							
       */
      sourceSelector?: string;
    };
  };
}
