// return language parameters for page

import * as i18n from '/lib/xp/i18n'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'

const english = i18n.getPhrases('en', ['site/i18n/phrases'])
const norwegian = i18n.getPhrases('', ['site/i18n/phrases'])

exports.getLanguage = function(page) {
  const site = portal.getSite()
  portal.pageUrl({ path: '/mimir/en' })

  const result = page.language === 'en' ? {
      path: page._path.replace(/^\/.*?\/en/, site._path),
      home: portal.pageUrl({ path: site._path }),
      phrases: english
    } : {
      path: page._path.replace(/^\/.*?\//, site._path + '/en/'),
      home: portal.pageUrl({ path: site._path + '/en' }),
      phrases: norwegian
    }

  result.exists = content.exists({ key: result.path })

// log.info(JSON.stringify(result, null, ' '))

  return result
}

