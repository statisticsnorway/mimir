// return language parameters for page

import * as i18n from '/lib/xp/i18n'
import * as portal from '/lib/xp/portal'

const english = i18n.getPhrases('en', ['site/i18n/phrases'])
const norwegian = i18n.getPhrases('', ['site/i18n/phrases'])

exports.getLanguage = function(page) {
  const site = portal.getSite()
log.info('-- running language lib --')
log.info(JSON.stringify(site, null, ' '))
  portal.pageUrl({ path: '/mimir/en' })

  const result = page.language === 'en' ? {
      home: portal.pageUrl({ path: site._path }),
      phrases: english
    } : {
      home: portal.pageUrl({ path: site._path + '/en' }),
      phrases: norwegian
    }

  return result
}

