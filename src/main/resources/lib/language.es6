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
      alternate: 'nb',
      published: page.publish && page.publish.from && moment(page.publish.from).format('DD. MMMM YYYY'),
      modified: moment(page.modifiedTime).format('DD. MMMM YYYY'),
      path: page._path.replace(/^\/.*?\/en/, site._path),
      home: portal.pageUrl({ path: site._path }),
      phrases: english
    } : {
      code: 'nb', // https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
      alternate: 'en',
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

