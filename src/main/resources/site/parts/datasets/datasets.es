const portal = require('/lib/xp/portal')
const util = require('/lib/util')
const contentLib = require('/lib/xp/content')
const thymeleaf = require('/lib/thymeleaf')

exports.get = function(req) {

  const view = resolve('./datasets.html')
  const content = portal.getContent()
  const contentPath = portal.getContent()._path

  var datasets = contentLib.getChildren({
    key: contentPath,
    start: 0,
    count: 99,
    sort: '_modifiedTime ASC'
  });

  log.info(JSON.stringify(datasets, null, ' '))

  const model = { content, datasets }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}