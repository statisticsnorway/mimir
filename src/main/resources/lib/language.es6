const moment = require('moment/min/moment-with-locales')
const i18n = __non_webpack_require__( '/lib/xp/i18n')
const portal = __non_webpack_require__( '/lib/xp/portal')
const content = __non_webpack_require__( '/lib/xp/content')

const english = i18n.getPhrases('en', ['site/i18n/phrases'])
const norwegian = i18n.getPhrases('', ['site/i18n/phrases'])

exports.getLanguage = function(page) {
  const site = portal.getSite()
  const siteConfig = portal.getSiteConfig()

  moment.locale(page.language ? page.language : 'nb')

  const currentLanguageConfig = siteConfig.language.filter( (language) => language.code === page.language)[0]
  const alternativeLanguagesConfig = siteConfig.language.filter( (language) => language.code !== page.language)
  const currentLangPath = currentLanguageConfig.link ? currentLanguageConfig.link : ''
  const pagePathAfterSiteName = page._path.replace(`${site._path}${currentLangPath}`, '')

  const alternativeLanguages = alternativeLanguagesConfig.map( (altLanguage) => {
    const altVersionPath = altLanguage.link ? altLanguage.link : ''
    const altVersionUri = `${site._path}${altVersionPath}${pagePathAfterSiteName}`
    const altVersionExists = content.exists({
      key: altVersionUri
    })
    let path = '';
    if(altVersionExists) {
      path = portal.pageUrl({
        path: altVersionUri
      })
    } else if(altLanguage.homePageId) {
      path = portal.pageUrl({
        id: altLanguage.homePageId
      })
    } else {
      path = portal.pageUrl({
        path: altVersionPath
      })
    }

    return {
      code: altLanguage.code,
      title: altLanguage.label,
      altVersionExists,
      path
    }
  })

  const result = {
    menuContentId: currentLanguageConfig.menuContentId,
    code: currentLanguageConfig.code,
    link: (currentLanguageConfig.link !== null) ? currentLanguageConfig.link : '',
    phrases: {
      ...(i18n.getPhrases(page.language === 'nb' ? '' : page.language, ['site/i18n/phrases']))
    },
    alternativeLanguages
  }

  return result
}


exports.getPhrases = (page) => {
  return page.language && page.language === 'en' ? english : norwegian
}

/**
 * Checks if the time is a year (four digits), if not parse it.
 * @param {string} time
 * @return {string}
 */
exports.localizeTimePeriod = (time) => {
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
function parseTimeInterval(time) {
  const splitYearLetterNumberIntoArray = new RegExp(/(\d{4})([HKMTU])(\d{1,2})/)
  const interval = splitYearLetterNumberIntoArray.exec(time)

  let parsedTime = ''
  switch (interval[2]) {
  case 'H':
    parsedTime = `${i18n.localize({
      key: 'interval.' + interval[2]
    })} ${interval[1]} `
    break
  case 'K':
    parsedTime = `${interval[3]}. ${i18n.localize({
      key: 'interval.' + interval[2]
    })} ${interval[1]}`
    break
  case 'M':
    parsedTime = `${i18n.localize({
      key: 'interval.M' + interval[2]
    })} ${interval[1]}`
    break
  case 'T':
    parsedTime = `${interval[3]}. ${i18n.localize({
      key: 'interval.' + interval[2]
    })} ${interval[1]}`
    break
  case 'U':
    parsedTime = `${i18n.localize({
      key: 'interval.' + interval[2]
    })} ${interval[3]} ${interval[1]}`
    break
  }
  return parsedTime
}


