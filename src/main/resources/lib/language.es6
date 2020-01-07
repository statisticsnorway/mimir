const moment = require('moment/min/moment-with-locales')
const i18n = __non_webpack_require__( '/lib/xp/i18n')
const portal = __non_webpack_require__( '/lib/xp/portal')
const content = __non_webpack_require__( '/lib/xp/content')

const english = i18n.getPhrases('en', ['site/i18n/phrases'])
const norwegian = i18n.getPhrases('', ['site/i18n/phrases'])

exports.getLanguage = function(page) {
  const site = portal.getSite()
  const siteConfig = portal.getSiteConfig()

  const nb = siteConfig.language[0]; // properties for norsk (bokmål)
  const en = siteConfig.language[1]; // properties for english

  moment.locale(page.language === 'en' ? 'en' : 'nb')

  const result = page.language === 'en' ? {
    code: en.code,
    alternate: en.alternate, // alternate language code norsk bokmål
    link: (en.link == null) ? '' : en.link,
    published: page.publish && page.publish.from && moment(page.publish.from).format('DD. MMMM YYYY'),
    modified: moment(page.modifiedTime).format('DD. MMMM YYYY'),
    path: page._path.replace(/^\/.*?\/en/, site._path),
    home: portal.pageUrl({ path: site._path }),
    phrases: (en.phrases == 'english') ? english : norwegian
  } : {
    code: nb.code, // norsk bokmål, https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
    alternate:  nb.alternate, // alternate language code
    link: (nb.link == null) ? '' : nb.link,
    published: page.publish && page.publish.from && moment(page.publish.from).format('DD. MMMM YYYY').toLowerCase(),
    modified: moment(page.modifiedTime).format('DD. MMMM YYYY').toLowerCase(),
    path: page._path.replace(/^\/.*?\//, site._path + en.link + '/'),
    home: portal.pageUrl({ path: site._path + en.link }),
    phrases: (nb.phrases == 'norwegian') ? norwegian : english
  }

  result.pageUrl = portal.pageUrl({
    path: result.path
  })
  result.exists = content.exists({ key: result.path })

  return result
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
    parsedTime = `${i18n.localize({key: 'interval.' + interval[2]})} ${interval[1]} `
    break;
  case 'K':
    parsedTime = `${interval[3]}. ${i18n.localize({key: 'interval.' + interval[2]})} ${interval[1]}`
    break;
  case 'M':
    parsedTime = `${i18n.localize({key: 'interval.M' + interval[2]})} ${interval[1]}`
    break;
  case 'T':
    parsedTime = `${interval[3]}. ${i18n.localize({key: 'interval.' + interval[2]})} ${interval[1]}`
    break;
  case 'U':
    parsedTime = `${i18n.localize({key: 'interval.' + interval[2]})} ${interval[3]} ${interval[1]}`
    break;
  }
  return parsedTime;
}


