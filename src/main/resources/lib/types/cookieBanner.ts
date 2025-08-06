import { type Phrases } from './language'

export interface CookieBannerProps {
  language: string
  phrases: Phrases
  baseUrl: string
  cookieBannerTitle: string
  cookieBannerText: string
  cookieBannerLinkText: string
}
