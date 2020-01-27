export interface InfoGraphicsPartConfig {
  /**
   * Tittel på visualinseringen
   */
  title: string;

  /**
   * Infografikk eller visualinsering
   */
  image: string;

  /**
   * Fotnoe til bilde
   */
  footNote: string;

  /**
   * Alternativ tekst til bilde
   */
  altText: string;

  /**
   * Long descrition hjelpetekst
   */
  longDesc?: string;
}
