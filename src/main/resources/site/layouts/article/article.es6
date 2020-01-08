const moment = require('moment/min/moment-with-locales')
const portal = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')

moment.locale('nb')

exports.get = function (req) {
  const page = portal.getContent()
  const component = portal.getComponent()
  const view = resolve('article.html')

  const published = page.publish && page.publish.from && moment(page.publish.from).format('DD. MMMM YYYY').toLowerCase()
  const publishedDatetime = page.publish && page.publish.from && moment(page.publish.from).format('YYYY-MM-DD HH:MM')

  const modified = moment(page.modifiedTime).format('DD. MMMM YYYY').toLowerCase()
  const modifiedDatetime = moment(page.modifiedTime).format('YYYY-MM-DD HH:MM')

  const leftSize = 'col-md-4'
  const rightSize = 'col-md-8'

  page.displayNameURLencoded = encodeURI(page.displayName)
  page.url = encodeURI(portal.pageUrl({ type: 'absolute', id: page._id }))

  const model = { page, aside: component.regions.aside, leftSize, rightSize, published, publishedDatetime, modified, modifiedDatetime }
  const body = thymeleaf.render(view, model)

  return { body }
}
