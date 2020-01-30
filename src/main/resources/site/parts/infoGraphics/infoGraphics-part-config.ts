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
   * Fotnote til bilde
   */
  footNote?: string;

  /**
   * Alternativ tekst til bilde
   */
  altText: string;

  /**
   * Beskrivende hjelpetekst for blinde
   */
  longDesc?: string;
}
