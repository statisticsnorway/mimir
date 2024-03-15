import { get, Content } from '/lib/xp/content'
import { assetUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { Link, createMenuTree, parseGlobalLinks } from '/lib/ssb/parts/menu'
import { type Language } from '/lib/types/language'
import * as util from '/lib/util'
import { type MenuItem, type Footer } from '/site/content-types'

export function getFooterContent(language: Language): FooterContent | undefined {
  if (language.footerId === undefined || language.footerId === null) {
    return undefined
  } else {
    const footerContent: Content<Footer> | null = get({
      key: language.footerId,
    })

    if (!footerContent) throw new Error(`Could not get footer content with id ${language.footerId}`)

    return {
      logoUrl: assetUrl({
        path: 'SSB_logo_white.svg',
      }),
      copyrightUrl: footerContent.data.copyrightUrl,
      copyrightText: localize({
        key: 'copyrightStatisticsNorway',
        locale: language.code,
      }),
      facebookUrl: footerContent.data.facebookUrl,
      twitterUrl: footerContent.data.twitterUrl,
      linkedinUrl: footerContent.data.linkedinUrl,
      rssUrl: footerContent.data.rssUrl,
      globalLinks:
        footerContent.data.globalLinks && util.data.forceArray(footerContent.data.globalLinks).length > 0
          ? parseGlobalLinks(util.data.forceArray(footerContent.data.globalLinks))
          : [],
      footerNavigation: footerContent.data.footerContentId ? createMenuTree(footerContent.data.footerContentId) : [],
      topButtonText: localize({
        key: 'toTheTop',
        locale: language.code,
      }),
      hiddenFooterText: localize({
        key: 'footerHiddenTitle',
        locale: language.code,
      }),
    }
  }
}

export interface FooterContent {
  logoUrl: string
  copyrightUrl: string
  copyrightText: string
  facebookUrl: string
  twitterUrl: string
  linkedinUrl: string
  rssUrl: string
  globalLinks: Array<Link>
  footerNavigation?: Array<MenuItem>
  topButtonText?: string
  hiddenFooterText?: string
}
