const test = __non_webpack_require__('/lib/xp/testing')

test.mock('/lib/xp/portal', {
  getContent: function() {
    return {
      '_id': '9b8806c8-1b5a-4a14-aa00-a7bfea4a19bd',
      '_name': 'utenriksokonomi',
      '_path': '/ssb/utenriksokonomi',
      'creator': 'user:system:trine',
      'displayName': 'Utenriks├╕konomi',
      'language': 'nb'
    }
  }
})

test.mock('/lib/xp/content', {
  query: function() {
    return {
      'total': 5,
      'count': 5,
      'hits': [
        {
          '_id': '1ea0baaa-9712-462d-9b86-1fcfca4a748e',
          '_name': 'bank-og-finansmarked',
          '_path': '/ssb/menyer-norsk/hovedmeny/okonomi/bank-og-finansmarked',
          'type': 'mimir:menuItem',
          'displayName': 'Bank og finansmarked',
          'language': 'nb',
          'data': {
            'icon': 'f7e02cfd-4cc8-4de3-a35e-eb71f50d3308',
            'urlSrc': {
              '_selected': 'manual',
              'manual': {
                'url': '/bank-og-finansmarked'
              }
            }
          }
        },
        {
          '_id': 'f37dc281-6c3d-4640-8672-cdc8e7677239',
          '_name': 'nasjonalregnskap-og-konjunkturer',
          '_path': '/ssb/menyer-norsk/hovedmeny/okonomi/nasjonalregnskap-og-konjunkturer',
          'type': 'mimir:menuItem',
          'displayName': 'Nasjonalregnskap og konjunkturer',
          'language': 'nb',
          'data': {
            'urlSrc': {
              '_selected': 'manual',
              'manual': {
                'url': '/nasjonalregnskap-og-konjunkturer'
              }
            },
            'icon': '66b06eff-c8e2-450b-a612-74593070753c'
          }
        },
        {
          '_id': '267a09bb-4878-4125-b974-b0e773e24eee',
          '_name': 'offentlig-sektor',
          '_path': '/ssb/menyer-norsk/hovedmeny/okonomi/offentlig-sektor',
          'type': 'mimir:menuItem',
          'displayName': 'Offentlig sektor',
          'language': 'nb',
          'data': {
            'urlSrc': {
              '_selected': 'manual',
              'manual': {
                'url': '/offentlig-sektor'
              }
            },
            'icon': 'f94736b1-7eae-4d80-a7fa-90b4ff5a6874'
          }
        },
        {
          '_id': '3761373a-9f87-4a17-b405-78b24607a7ff',
          '_name': 'priser-og-prisindekser',
          '_path': '/ssb/menyer-norsk/hovedmeny/okonomi/priser-og-prisindekser',
          'type': 'mimir:menuItem',
          'displayName': 'Priser og prisindekser',
          'language': 'nb',
          'data': {
            'urlSrc': {
              '_selected': 'manual',
              'manual': {
                'url': '/priser-og-prisindekser'
              }
            },
            'icon': '2ec69acc-ed67-472b-958c-3ab2b25d9738'
          }
        },
        {
          '_id': '12bdd689-7ce3-4058-b014-2e7925620668',
          '_name': 'utenriksokonomi',
          '_path': '/ssb/menyer-norsk/hovedmeny/okonomi/utenriksokonomi',
          'type': 'mimir:menuItem',
          'displayName': 'Utenriks├╕konomi',
          'language': 'nb',
          'data': {
            'icon': '4c622669-fc0b-4aef-a218-6bc511c1f757',
            'urlSrc': {
              '_selected': 'manual',
              'manual': {
                'url': '/utenriksokonomi'
              }
            }
          }
        }
      ],
      'aggregations': {},
      'highlight': {}
    }
  }
})

const menuLib = __non_webpack_require__( '/lib/ssb/parts/menu')
const {
  query
} = __non_webpack_require__( '/lib/xp/content')
const {
  getContent
} = __non_webpack_require__( '/lib/xp/portal')

exports.testActiveMenuItemFromContent = function() {
  const children = query({
    contentTypes: [`${app.name}:menuItem`],
    query: `_parentPath = '/content/ssb/menyer-norsk/hovedmeny/okonomi/'`,
    count: 99
  })
  const content = getContent()

  const result = menuLib.isMenuItemActive(children, content)
  test.assertTrue(result, 'Checking if menu item is active based on portal getContent')
}

exports.testParseTopLinks = function() {
  const topLinkConfig = [{
    'linkTitle': 'Forskning',
    'urlSrc': {
      '_selected': 'manual',
      'manual': {
        'url': 'https://www.ssb.no/forskning/forskning-i-ssb'
      }
    }
  }, {
    'linkTitle': 'Innrapportering',
    'urlSrc': {
      '_selected': 'manual',
      'manual': {
        'url': 'https://www.ssb.no/innrapportering'
      },
      'content': {}
    }
  }, {
    'linkTitle': 'Vi bruker cookies',
    'urlSrc': {
      '_selected': 'manual',
      'manual': {
        'url': 'https://www.ssb.no/omssb/personvern'
      },
      'content': {}
    }
  }]
  const result = menuLib.parseTopLinks(topLinkConfig)
  test.assertJson([
    {
      'title': 'Forskning',
      'path': 'https://www.ssb.no/forskning/forskning-i-ssb'
    }, {
      'title': 'Innrapportering',
      'path': 'https://www.ssb.no/innrapportering'
    }, {
      'title': 'Vi bruker cookies',
      'path': 'https://www.ssb.no/omssb/personvern'
    }
  ], result, 'Checking top links')
}

exports.testParseGlobalLinks = function() {
  const globalLinksConfig = [{
    'linkTitle': 'Stikkord A-├à',
    'urlSrc': {
      '_selected': 'manual',
      'manual': {
        'url': 'https://www.ssb.no/a-aa'
      }
    }
  }, {
    'linkTitle': 'Nettstedskart',
    'urlSrc': {
      '_selected': 'manual',
      'manual': {
        'url': 'https://www.ssb.no/nettstedskart'
      },
      'content': {}
    }
  }]

  const result = menuLib.parseGlobalLinks(globalLinksConfig)
  test.assertJson([
    {
      'title': 'Stikkord A-├à',
      'path': 'https://www.ssb.no/a-aa'
    }, {
      'title': 'Nettstedskart',
      'path': 'https://www.ssb.no/nettstedskart'
    }
  ], result, 'Checking global links')
}

