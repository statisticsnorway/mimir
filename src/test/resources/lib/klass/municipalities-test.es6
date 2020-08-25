const test = __non_webpack_require__('/lib/xp/testing')
const municipalities = __non_webpack_require__( '/lib/klass/municipalities')

const requestWithCode = {
  'method': 'GET',
  'scheme': 'http',
  'host': 'localhost',
  'port': 8080,
  'path': '/admin/site/preview/default/draft/ssb/kommunefakta/kommune',
  'rawPath': '/admin/site/preview/default/draft/ssb/kommunefakta/kommune',
  'url': 'http://localhost:8080/admin/site/preview/default/draft/ssb/kommunefakta/kommune?selfRequest=true&municipality={%22code%22:%221833%22,%22displayName%22:%22Rana%22,%22county%22:{%22name%22:%22Nordland%22},%22path%22:%22/rana%22,%22changes%22:[]}&pageTitle=Kommunefakta%20Rana',
  'remoteAddress': '127.0.0.1',
  'mode': 'preview',
  'webSocket': false,
  'repositoryId': 'com.enonic.cms.default',
  'branch': 'draft',
  'params': {
    'municipality': '{"code":"1833","displayName":"Rana","county":{"name":"Nordland"},"path":"/rana","changes":[]}',
    'pageTitle': 'Kommunefakta Rana',
    'selfRequest': 'true'
  },
  'headers': {
    'Cookie': 'enonic_xp_tour=tour; app.browse.RecentItemsList=mimir%3Atable%7Cmimir%3AstatisticsTable%7Cportal%3Apage-template; JSESSIONID=739b800e-a6bf-4fb9-b43c-e366462677811js8s49iki420gnhupgh14nvw0.739b800e-a6bf-4fb9-b43c-e36646267781',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Connection': 'keep-alive',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Dest': 'document',
    'Host': 'localhost:8080',
    'Pragma': 'no-cache',
    'Accept-Encoding': 'gzip',
    'Sec-Fetch-Mode': 'navigate',
    'Cache-Control': 'no-cache',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-User': '?1',
    'Accept-Language': 'nb-NO,nb;q=0.9,no;q=0.8,nn;q=0.7,en-US;q=0.6,en;q=0.5,es;q=0.4'
  },
  'cookies': {
    'enonic_xp_tour': 'tour',
    'app.browse.RecentItemsList': 'mimir%3Atable%7Cmimir%3AstatisticsTable%7Cportal%3Apage-template',
    'JSESSIONID': '739b800e-a6bf-4fb9-b43c-e366462677811js8s49iki420gnhupgh14nvw0.739b800e-a6bf-4fb9-b43c-e36646267781'
  }
}

exports.testGetMunicipality = function() {
  const result = municipalities.getMunicipality(requestWithCode)
  test.assertJson({
    'code': '1833',
    'displayName': 'Rana',
    'county': {
      'name': 'Nordland'
    },
    'path': '/rana',
    'changes': []
  }, result, 'Checking get Munipality from request')
}

exports.testCreatePathWithCounty = function() {
  const result = municipalities.createPath('Rana', 'Nordland')
  test.assertEquals('/rana-nordland', result, 'Navn funnet')
}

exports.testCreatePathWithSamiName = function() {
  const result = municipalities.createPath('Kárášjohka - Karasjok')
  test.assertEquals('/karasjohka-karasjok', result, 'Navn funnet')
}

exports.testCreatePathWithNorwegianLetters = function() {
  const result = municipalities.createPath('Bodø')
  test.assertEquals('/bodo', result, 'Navn funnet')
}

