export interface InfoGraphicsPartConfig {
  /**
   * Tittel på visualinseringen
   */
  title: string;

  /**
   * Infografikk eller visualisering
   */
  image: string;

  /**
   * *IKKE LENGER I BRUK* (bruk alt tekst på valgt bilde)
   */
  altText?: string;

  /**
   * Beskrivende hjelpetekst for blinde
   */
  longDesc?: string;

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

  /**
   * Fotnote-tekst
   */
  footNote?: string;
}
