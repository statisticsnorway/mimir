import { Response } from 'enonic-types/controller'
import { PortalLibrary } from 'enonic-types/portal'
import axios from 'axios'
const {
  serviceUrl
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')

function get(): Response {
  return {
    body: getRssNews(),
    contentType: 'text/plain'
  }
}
exports.get = get

function getRssNews(): string {
  const urlToServiceRssNews: string = serviceUrl({
    service: 'news'
  })

  let test: string = 'Starter'

  axios.get(urlToServiceRssNews)
    .then((res) => {
      test = res.statusText
    })
    .catch((err) => {
      test = 'Feiler: ' + err
    })

  return test
}

interface ResponseNews {
  body: string;
  contentType: string;
}


