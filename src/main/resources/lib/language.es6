// Returns language parameters for page

const moment = require('/lib/moment-with-locales')

import * as i18n from '/lib/xp/i18n'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'

const english = i18n.getPhrases('en', ['site/i18n/phrases'])
const norwegian = i18n.getPhrases('', ['site/i18n/phrases'])

exports.getLanguage = function(page) {
  const site = portal.getSite()
  moment.locale(page.language === 'en' ? 'en' : 'nb')
  const result = page.language === 'en' ? {
      code: 'en',
      alternate: 'nb', // alternate language code norsk bokmål
      contact: 'https://www.ssb.no/en/omssb/kontakt-oss',
      published: page.publish && page.publish.from && moment(page.publish.from).format('DD. MMMM YYYY'),
      modified: moment(page.modifiedTime).format('DD. MMMM YYYY'),
      path: page._path.replace(/^\/.*?\/en/, site._path),
      home: portal.pageUrl({ path: site._path }),
      phrases: english
    } : {
      code: 'nb', // norsk bokmål, https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
      alternate: 'en', // alternate language code
      contact: 'https://www.ssb.no/omssb/kontakt-oss',
      published: page.publish && page.publish.from && moment(page.publish.from).format('DD. MMMM YYYY').toLowerCase(),
      modified: moment(page.modifiedTime).format('DD. MMMM YYYY').toLowerCase(),
      path: page._path.replace(/^\/.*?\//, site._path + '/en/'),
      home: portal.pageUrl({ path: site._path + '/en' }),
      phrases: norwegian
    }

  result.exists = content.exists({ key: result.path })

// log.info(JSON.stringify(result, null, ' '))

  return result
}


/**
 * Checks if the time is a year (four digits), if not parse it.
 * @param {string} time
 * @return {string}
 */
exports.localizeTimePeriod = (time) => {
  return time.length === 4 ?  time : parseTimeInterval(time)
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
  switch(interval[2]) {
    case 'H':
      parsedTime = `${interval[1]} ${i18n.localize({key: 'interval.' + interval[2]})}`
      break;
    case 'K':
      log.info(i18n.localize({key: 'interval.' + interval[2]}))
      parsedTime = `${interval[1]} ${interval[3]}. ${i18n.localize({key: 'interval.' + interval[2]})}`
      break;
    case 'M':
      parsedTime = `${interval[1]} ${i18n.localize({key: 'interval.M' + interval[2]})}`
      break;
    case 'T':
      parsedTime = `${interval[1]} ${interval[3]}. ${i18n.localize({key: 'interval.' + interval[2]})}`
      break;
    case 'U':
      parsedTime = `${interval[1]} ${interval[3]}`
      break;
  }
  return parsedTime;
}
