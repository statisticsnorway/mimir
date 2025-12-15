import { get, Content } from '/lib/xp/content'
import { localize } from '/lib/xp/i18n'
import { assetUrl } from '/lib/enonic/asset'
import { createMenuTree, parseGlobalLinks } from '/lib/ssb/parts/menu'
import { type Language } from '/lib/types/language'
import * as util from '/lib/util'
import { type FooterContent } from '/lib/types/footer'
import { isEnabled } from '/lib/featureToggle'
import { type Footer } from '/site/content-types'

export function getFooterContent(
  language: Language,
  baseUrl: string,
  useAnniversary: boolean
): FooterContent | undefined {
  if (language.footerId === undefined || language.footerId === null) {
    return undefined
  } else {
    const footerContent: Content<Footer> | null = get({
      key: language.footerId,
    })

    if (!footerContent) throw new Error(`Could not get footer content with id ${language.footerId}`)
    const isCookiebannerEnabled = isEnabled('show-cookie-banner', false, 'ssb')

    return {
      logoUrl: assetUrl({
        path: useAnniversary
          ? language.code === 'en'
            ? 'SSB_logo_anniversary_en_white.svg'
            : 'SSB_logo_anniversary_no_white.svg'
          : 'SSB_logo_white.svg',
      }),
      copyrightUrl: footerContent.data.copyrightUrl,
      copyrightText: localize({
        key: 'copyrightStatisticsNorway',
        locale: language.code,
      }),
      facebookUrl: footerContent.data.facebookUrl,
      linkedinUrl: footerContent.data.linkedinUrl,
      instagramUrl: footerContent.data.instagramUrl,
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
      isCookiebannerEnabled,
      baseUrl,
    }
  }
}
