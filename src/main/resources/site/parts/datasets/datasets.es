const portal = require('/lib/xp/portal')
const util = require('/lib/util')
const contentLib = require('/lib/xp/content')
const thymeleaf = require('/lib/thymeleaf')
const moment = require('/lib/moment-with-locales')

exports.get = function(req) {

  const view = resolve('./datasets.html')
  const content = portal.getContent()
  const contentPath = portal.getContent()._path

  var contentChildren = contentLib.getChildren({
    key: contentPath,
    start: 0,
    count: 99,
    sort: '_modifiedTime ASC'
  }).hits;

  var datasets = [];
  if (contentChildren.length > 0) {
    for (var i = 0; i < contentChildren.length; i++) {
      var dataset = {};
      dataset.title = contentChildren[i].data.title;
      dataset.subtitle = contentChildren[i].data.subtitle;
      dataset.path = portal.pageUrl({id: contentChildren[i]._id});

      var excelFile = contentLib.getChildren({
        key: contentChildren[i]._path,
        start: 0,
        count: 1,
        sort: '_modifiedTime ASC',
        query: "type ='media:spreadsheet'"
      })

      moment.locale('nb')
      dataset.excelPath =  portal.attachmentUrl({id: excelFile.hits[0]._id});
      dataset.excelModifiedDate = moment(excelFile.hits[0].modifiedTime).format('DD-MM-YYYY')
      datasets.push(dataset);
    }
  }
  const model = { content, datasets }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}