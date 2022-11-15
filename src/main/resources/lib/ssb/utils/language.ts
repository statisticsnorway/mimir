import { exists, Content, Site } from '/lib/xp/content'
import { SiteConfig } from '../../../site/site-config'
import { Language, AlternativeLanguages, Phrases } from '../../types/language'

const i18n = __non_webpack_require__('/lib/xp/i18n')
const { getSite, getSiteConfig, pageUrl } = __non_webpack_require__('/lib/xp/portal')

let english: Phrases | undefined
let norwegian: Phrases | undefined
let newNorwegian: Phrases | undefined

try {
  english = i18n.getPhrases('en', ['site/i18n/phrases'])
  norwegian = i18n.getPhrases('', ['site/i18n/phrases'])
  newNorwegian = i18n.getPhrases('nn', ['site/i18n/phrases'])
} catch (e) {
  e.toString()
}

exports.getLanguage = function (page: Content): Language {
  const site: Site<SiteConfig> = getSite()
  const siteConfig: SiteConfig = getSiteConfig()
  const currentLanguageConfig: Language = siteConfig.language.filter((language) => language.code === page.language)[0]

  const alternativeLanguagesConfig: SiteConfig['language'] = siteConfig.language.filter(
    (language) => language.code !== page.language
  )
  const currentLangPath: string = currentLanguageConfig && currentLanguageConfig.link ? currentLanguageConfig.link : ''
  const pagePathAfterSiteName: string = page._path.replace(`${site._path}${currentLangPath}`, '')

  const alternativeLanguages: Array<AlternativeLanguages> = alternativeLanguagesConfig.map((altLanguage) => {
    const altVersionPath: string = altLanguage.link ? altLanguage.link : ''
    const altVersionUri = `${site._path}${altVersionPath}${pagePathAfterSiteName}`
    const altVersionExists: boolean = exists({
      key: altVersionUri,
    })
    let path = ''
    if (altVersionExists) {
      path = pageUrl({
        path: altVersionUri,
      })
    } else if (altLanguage.homePageId) {
      path = pageUrl({
        id: altLanguage.homePageId,
      })
    } else {
      path = pageUrl({
        path: altVersionPath,
      })
    }

    return {
      code: altLanguage.code,
      title: altLanguage.label,
      altVersionExists,
      path,
    }
  })

  const norwegianConfig: Language = siteConfig.language[0]
  const result: Language = {
    menuContentId: currentLanguageConfig ? currentLanguageConfig.menuContentId : norwegianConfig.menuContentId,
    headerId: currentLanguageConfig ? currentLanguageConfig.headerId : norwegianConfig.headerId,
    footerId: currentLanguageConfig ? currentLanguageConfig.footerId : norwegianConfig.footerId,
    code: currentLanguageConfig ? currentLanguageConfig.code : page.language,
    link: currentLanguageConfig ? (currentLanguageConfig.link ? currentLanguageConfig.link : '/') : '/',
    standardSymbolPage: currentLanguageConfig
      ? currentLanguageConfig.standardSymbolPage
      : norwegianConfig.standardSymbolPage,
    phrases: {
      ...i18n.getPhrases(page.language === 'nb' ? '' : (page.language as string), ['site/i18n/phrases']),
    },
    alternativeLanguages:
      page.language === 'nb' || page.language === 'en'
        ? alternativeLanguages
        : alternativeLanguages.filter((altLanguage) => altLanguage.code === 'en'),
  }

  return result
}

exports.getPhrases = (page: Content): Phrases | undefined => {
  if (page.language) {
    if (page.language === 'en') {
      return english
    } else if (page.language === 'nn') {
      return newNorwegian
    } else {
      return norwegian
    }
  }
  return
}

/**
 * Checks if the time is a year (four digits), if not parse it.
 * @param {string} time
 * @return {string}
 */
exports.localizeTimePeriod = (time: string): string => {
  return time.length === 4 ? time : parseTimeInterval(time)
}

/**
 * Parse date standard from statistikkbanken into localized human readable value
 * The standard is documented here:
 * https://www.scb.se/en/services/statistical-programs-for-px-files/px-web/px-web-med-sql-databas/
 *
 * @param {string} time
 * @return {string}
 */
function parseTimeInterval(time: string): string {
  const splitYearLetterNumberIntoArray = new RegExp(/(\d{4})([HKMTU])(\d{1,2})/)
  const interval: RegExpExecArray | null = splitYearLetterNumberIntoArray.exec(time)

  let parsedTime = ''
  if (interval) {
    switch (interval[2]) {
      case 'H':
        parsedTime = `${i18n.localize({
          key: 'interval.' + interval[2],
        })} ${interval[1]} `
        break
      case 'K':
        parsedTime = `${interval[3]}. ${i18n.localize({
          key: 'interval.' + interval[2],
        })} ${interval[1]}`
        break
      case 'M':
        parsedTime = `${i18n.localize({
          key: 'interval.M.' + interval[3],
        })} ${interval[1]}`
        break
      case 'T':
        parsedTime = `${interval[3]}. ${i18n.localize({
          key: 'interval.' + interval[2],
        })} ${interval[1]}`
        break
      case 'U':
        parsedTime = `${i18n.localize({
          key: 'interval.' + interval[2],
        })} ${interval[3]} ${interval[1]}`
        break
    }
    return parsedTime
  }
  return parsedTime
}

export function getLanguageShortName(content: Content): string {
  const norwegianPhrasesSuffix = 'no'
  if (!content || !content.language) {
    return norwegianPhrasesSuffix
  } else {
    return content.language === 'nb' ? norwegianPhrasesSuffix : content.language
  }
}
