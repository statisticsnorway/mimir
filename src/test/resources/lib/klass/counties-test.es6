const test = __non_webpack_require__('/lib/xp/testing')
const counties = __non_webpack_require__( '/lib/klass/counties')

test.mock('/lib/xp/portal', {
  getSiteConfig: function() {
    return {
      'municipality': 'http://data.ssb.no/api/klass/v1/classifications/131/codesAt?date=2019-01-01',
      'county': 'http://data.ssb.no/api/klass/v1/classifications/104/codesAt?date=2019-01-01',
      'municipalDataContentId': 'b09545f4-a047-4a65-b5e6-60b3150f7479',
      'countyDataContentId': '296490ad-d3fe-4c9e-b761-27912033e5dc',
      'defaultMunicipality': '0301',
      'language': [
        {
          'label': 'Norsk (Bokmål)',
          'code': 'nb',
          'alternate': 'en',
          'phrases': 'norwegian',
          'homePageId': '751090a3-60e3-4a6d-8956-dff920c735af',
          'menuContentId': '4641fff0-21d3-4e80-869c-4473439c8b65',
          'footerId': '325b58c3-236e-4f1a-b569-36ee15f12a13',
          'headerId': '4eb59118-a25e-488b-927e-7039565c88fd'
        },
        {
          'label': 'English',
          'code': 'en',
          'alternate': 'nb',
          'link': '/en',
          'phrases': 'english',
          'homePageId': '0b2fc023-9d32-4994-b0d0-453cdd56a6cb',
          'menuContentId': '21f317bc-6859-4b39-8605-318069cf7301',
          'footerId': 'f624a568-25b8-4d78-95b4-eaac60f2ff51',
          'headerId': '9158b3d5-50c8-4e6a-8bb5-d127f229a1f0'
        }
      ],
      'kommunefakta': {
        'mapfolder': '/mapdata/2020'
      },
      'municipalChangeListContentId': '212ce1e2-b2f3-4261-ba7b-5382bd4e60c2',
      'router': [
        {
          'source': '09c5ffff-c974-4a46-ae9b-f5270efaf5fa',
          'target': 'f1d2436a-65dc-4fa4-8890-936654f4b8d1',
          'pageTitle': 'Kommunefakta'
        },
        {
          'source': 'b99e9985-ad31-4262-91f5-ef8e676de337',
          'target': '7af107ce-af0b-4456-ba30-d632cea8f8c3',
          'pageTitle': 'Areal'
        }
      ],
      'searchResultPageId': '22369cc8-487c-4ecc-ad1a-f388182743ad',
      'topLinks': [
        {
          'linkTitle': 'Forskning',
          'urlSrc': {
            '_selected': 'manual',
            'manual': {
              'url': 'https://www.ssb.no/forskning/forskning-i-ssb'
            },
            'content': {}
          }
        },
        {
          'linkTitle': 'Innrapportering',
          'urlSrc': {
            '_selected': 'manual',
            'manual': {
              'url': 'https://www.ssb.no/innrapportering'
            },
            'content': {}
          }
        },
        {
          'linkTitle': 'Vi bruker cookies',
          'urlSrc': {
            '_selected': 'manual',
            'manual': {
              'url': 'https://www.ssb.no/omssb/personvern/'
            },
            'content': {}
          }
        }
      ],
      'searchResultPage': {
        '_selected': 'manual',
        'manual': {
          'url': '/sok'
        },
        'content': {}
      }
    }
  }
})

test.mock('/lib/xp/content', {
  getChildren: function() {
    return [
      {
        '_id': 'e87d570f-c005-4553-8374-a11646ca5067',
        '_name': 'fylkesliste-fra-klass-2020-datasett-opprettet-06.02.2020-09-52-31',
        '_path': '/ssb/kommunefakta/regionlister-klass/fylkesliste-fra-klass-2020/fylkesliste-fra-klass-2020-datasett-opprettet-06.02.2020-09-52-31',
        'creator': 'user:system:su',
        'modifier': 'user:system:su',
        'createdTime': '2020-02-06T08:52:31.133Z',
        'modifiedTime': '2020-04-13T09:03:23.235Z',
        'owner': 'user:system:su',
        'type': 'mimir:dataset',
        'displayName': 'Fylkesliste fra KLASS 2020 (datasett) endret 13.04.2020 09:03:23',
        'hasChildren': false,
        'language': 'nb',
        'valid': true,
        'childOrder': 'modifiedtime DESC',
        'data': {
          'table': 'http://data.ssb.no/api/klass/v1/classifications/104/codesAt?date=2020-01-01',
          'dataquery': '296490ad-d3fe-4c9e-b761-27912033e5dc',
          'json': '{"codes":[{"code":"03","parentCode":null,"level":"1","name":"Oslo","shortName":"","presentationName":""},{"code":"11","parentCode":null,"level":"1","name":"Rogaland","shortName":"","presentationName":""},{"code":"15","parentCode":null,"level":"1","name":"Møre og Romsdal","shortName":"","presentationName":""},{"code":"18","parentCode":null,"level":"1","name":"Nordland","shortName":"","presentationName":""},{"code":"30","parentCode":null,"level":"1","name":"Viken","shortName":"","presentationName":""},{"code":"34","parentCode":null,"level":"1","name":"Innlandet","shortName":"","presentationName":""},{"code":"38","parentCode":null,"level":"1","name":"Vestfold og Telemark","shortName":"","presentationName":""},{"code":"42","parentCode":null,"level":"1","name":"Agder","shortName":"","presentationName":""},{"code":"46","parentCode":null,"level":"1","name":"Vestland","shortName":"","presentationName":""},{"code":"50","parentCode":null,"level":"1","name":"Trøndelag - Trööndelage","shortName":"","presentationName":""},{"code":"54","parentCode":null,"level":"1","name":"Troms og Finnmark - Romsa ja Finnmárku","shortName":"","presentationName":""},{"code":"99","parentCode":null,"level":"1","name":"Uoppgitt","shortName":"","presentationName":""}]}'
        },
        'x': {},
        'page': {},
        'attachments': {},
        'publish': {
          'from': '2020-02-06T08:52:31.170Z',
          'first': '2020-02-06T08:52:31.170Z'
        },
        'workflow': {
          'state': 'READY',
          'checks': {}
        }
      }
    ]
  }
})

const {
  getSiteConfig
} = __non_webpack_require__( '/lib/xp/portal')

const {
  getChildren
} = __non_webpack_require__( '/lib/xp/content')

exports.testGetKeyFromSiteConfig = function() {
  const siteConfig = getSiteConfig()
  const result = counties.getKeyFromSiteConfig(siteConfig)
  test.assertEquals('296490ad-d3fe-4c9e-b761-27912033e5dc', result, 'Nøkkel funnet')
}
