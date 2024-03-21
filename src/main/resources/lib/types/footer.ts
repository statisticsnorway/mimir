import { MenuItemParsed, type Link } from './header'
import { Language } from './language'

export interface FooterContent {
  logoUrl: string
  copyrightUrl: string
  copyrightText: string
  facebookUrl: string
  twitterUrl: string
  linkedinUrl: string
  rssUrl: string
  globalLinks: Array<Link>
  footerNavigation: Array<MenuItemParsed>
  topButtonText?: string
  hiddenFooterText?: string
  language?: Language
}
