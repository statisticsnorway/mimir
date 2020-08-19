const test = __non_webpack_require__('/lib/xp/testing')

test.mock('/lib/xp/portal', {
  getContent: function() {
    return {
      '_id': '9b8806c8-1b5a-4a14-aa00-a7bfea4a19bd',
      '_name': 'utenriksokonomi',
      '_path': '/ssb/utenriksokonomi',
      'creator': 'user:system:trine',
      'modifier': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-9146',
      'createdTime': '2020-01-16T08:25:59.119Z',
      'modifiedTime': '2020-03-08T10:43:06.360Z',
      'owner': 'user:system:trine',
      'type': 'mimir:page',
      'displayName': 'Utenriks├╕konomi',
      'hasChildren': true,
      'language': 'nb',
      'valid': true,
      'childOrder': '_manualordervalue DESC, _ts DESC',
      'data': {},
      'x': {
        'com-enonic-app-metafields': {
          'meta-data': {
            'blockRobots': false
          }
        }
      },
      'page': {
        'type': 'page',
        'path': '/',
        'descriptor': 'mimir:default',
        'config': {
          'bkg_color': 'white',
          'regions': {
            'title': 'Leteside utenriks├╕konomi kommer her',
            'hideTitle': false,
            'region': 'Rad_A',
            'showGreyTriangle': false
          }
        },
        'regions': {
          'Rad_A': {
            'components': [],
            'name': 'Rad_A'
          },
          'Rad_B': {
            'components': [],
            'name': 'Rad_B'
          },
          'Rad_C': {
            'components': [],
            'name': 'Rad_C'
          },
          'Rad_D': {
            'components': [],
            'name': 'Rad_D'
          },
          'Rad_E': {
            'components': [],
            'name': 'Rad_E'
          },
          'Rad_F': {
            'components': [],
            'name': 'Rad_F'
          },
          'Rad_G': {
            'components': [],
            'name': 'Rad_G'
          },
          'Rad_H': {
            'components': [],
            'name': 'Rad_H'
          },
          'Rad_I': {
            'components': [],
            'name': 'Rad_I'
          },
          'Rad_J': {
            'components': [],
            'name': 'Rad_J'
          },
          'Rad_K': {
            'components': [],
            'name': 'Rad_K'
          },
          'Rad_L': {
            'components': [],
            'name': 'Rad_L'
          },
          'Rad_M': {
            'components': [],
            'name': 'Rad_M'
          },
          'Rad_N': {
            'components': [],
            'name': 'Rad_N'
          },
          'Rad_O': {
            'components': [],
            'name': 'Rad_O'
          },
          'Rad_P': {
            'components': [],
            'name': 'Rad_P'
          },
          'Rad_Q': {
            'components': [],
            'name': 'Rad_Q'
          },
          'Rad_R': {
            'components': [],
            'name': 'Rad_R'
          },
          'Rad_S': {
            'components': [],
            'name': 'Rad_S'
          },
          'Rad_T': {
            'components': [],
            'name': 'Rad_T'
          },
          'main': {
            'components': [],
            'name': 'main'
          }
        }
      },
      'attachments': {},
      'publish': {
        'from': '2020-02-12T11:44:42.950Z',
        'first': '2020-02-12T11:44:42.950Z'
      },
      'workflow': {
        'state': 'READY',
        'checks': {}
      }
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
          'creator': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'modifier': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'createdTime': '2020-02-20T14:27:17.138Z',
          'modifiedTime': '2020-03-20T10:06:40.499Z',
          'owner': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'type': 'mimir:menuItem',
          'displayName': 'Bank og finansmarked',
          'hasChildren': true,
          'language': 'nb',
          'valid': true,
          'childOrder': 'modifiedtime DESC',
          'data': {
            'icon': 'f7e02cfd-4cc8-4de3-a35e-eb71f50d3308',
            'urlSrc': {
              '_selected': 'manual',
              'manual': {
                'url': '/bank-og-finansmarked'
              }
            }
          },
          'x': {
            'com-enonic-app-metafields': {
              'meta-data': {
                'blockRobots': false
              }
            }
          },
          'page': {},
          'attachments': {},
          'publish': {
            'from': '2020-02-24T12:57:16.272Z',
            'first': '2020-02-24T12:57:16.272Z'
          },
          'workflow': {
            'state': 'READY',
            'checks': {}
          }
        },
        {
          '_id': 'f37dc281-6c3d-4640-8672-cdc8e7677239',
          '_name': 'nasjonalregnskap-og-konjunkturer',
          '_path': '/ssb/menyer-norsk/hovedmeny/okonomi/nasjonalregnskap-og-konjunkturer',
          'creator': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'modifier': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'createdTime': '2020-02-20T14:27:17.156Z',
          'modifiedTime': '2020-03-20T10:06:20.819Z',
          'owner': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'type': 'mimir:menuItem',
          'displayName': 'Nasjonalregnskap og konjunkturer',
          'hasChildren': true,
          'language': 'nb',
          'valid': true,
          'childOrder': 'modifiedtime DESC',
          'data': {
            'urlSrc': {
              '_selected': 'manual',
              'manual': {
                'url': '/nasjonalregnskap-og-konjunkturer'
              }
            },
            'icon': '66b06eff-c8e2-450b-a612-74593070753c'
          },
          'x': {
            'com-enonic-app-metafields': {
              'meta-data': {
                'blockRobots': false
              }
            }
          },
          'page': {},
          'attachments': {},
          'publish': {
            'from': '2020-02-24T12:59:14.223Z',
            'first': '2020-02-24T12:59:14.223Z'
          },
          'workflow': {
            'state': 'READY',
            'checks': {}
          }
        },
        {
          '_id': '267a09bb-4878-4125-b974-b0e773e24eee',
          '_name': 'offentlig-sektor',
          '_path': '/ssb/menyer-norsk/hovedmeny/okonomi/offentlig-sektor',
          'creator': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'modifier': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'createdTime': '2020-02-20T14:27:17.167Z',
          'modifiedTime': '2020-03-20T10:06:03.985Z',
          'owner': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'type': 'mimir:menuItem',
          'displayName': 'Offentlig sektor',
          'hasChildren': true,
          'language': 'nb',
          'valid': true,
          'childOrder': 'modifiedtime DESC',
          'data': {
            'urlSrc': {
              '_selected': 'manual',
              'manual': {
                'url': '/offentlig-sektor'
              }
            },
            'icon': 'f94736b1-7eae-4d80-a7fa-90b4ff5a6874'
          },
          'x': {
            'com-enonic-app-metafields': {
              'meta-data': {
                'blockRobots': false
              }
            }
          },
          'page': {},
          'attachments': {},
          'publish': {
            'from': '2020-02-24T12:58:47.185Z',
            'first': '2020-02-24T12:58:47.185Z'
          },
          'workflow': {
            'state': 'READY',
            'checks': {}
          }
        },
        {
          '_id': '3761373a-9f87-4a17-b405-78b24607a7ff',
          '_name': 'priser-og-prisindekser',
          '_path': '/ssb/menyer-norsk/hovedmeny/okonomi/priser-og-prisindekser',
          'creator': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'modifier': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'createdTime': '2020-02-20T14:27:17.178Z',
          'modifiedTime': '2020-03-20T10:05:46.077Z',
          'owner': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'type': 'mimir:menuItem',
          'displayName': 'Priser og prisindekser',
          'hasChildren': true,
          'language': 'nb',
          'valid': true,
          'childOrder': 'modifiedtime DESC',
          'data': {
            'urlSrc': {
              '_selected': 'manual',
              'manual': {
                'url': '/priser-og-prisindekser'
              }
            },
            'icon': '2ec69acc-ed67-472b-958c-3ab2b25d9738'
          },
          'x': {
            'com-enonic-app-metafields': {
              'meta-data': {
                'blockRobots': false
              }
            }
          },
          'page': {},
          'attachments': {},
          'publish': {
            'from': '2020-02-24T12:57:44.813Z',
            'first': '2020-02-24T12:57:44.813Z'
          },
          'workflow': {
            'state': 'READY',
            'checks': {}
          }
        },
        {
          '_id': '12bdd689-7ce3-4058-b014-2e7925620668',
          '_name': 'utenriksokonomi',
          '_path': '/ssb/menyer-norsk/hovedmeny/okonomi/utenriksokonomi',
          'creator': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'modifier': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'createdTime': '2020-02-20T14:27:17.189Z',
          'modifiedTime': '2020-03-20T10:05:21.481Z',
          'owner': 'user:adfs:s-1-5-21-2125401682-1754076223-1620198925-34016',
          'type': 'mimir:menuItem',
          'displayName': 'Utenriks├╕konomi',
          'hasChildren': true,
          'language': 'nb',
          'valid': true,
          'childOrder': 'modifiedtime DESC',
          'data': {
            'icon': '4c622669-fc0b-4aef-a218-6bc511c1f757',
            'urlSrc': {
              '_selected': 'manual',
              'manual': {
                'url': '/utenriksokonomi'
              }
            }
          },
          'x': {
            'com-enonic-app-metafields': {
              'meta-data': {
                'blockRobots': false
              }
            }
          },
          'page': {},
          'attachments': {},
          'publish': {
            'from': '2020-02-21T07:08:56.968Z',
            'first': '2020-02-21T07:08:56.968Z'
          },
          'workflow': {
            'state': 'READY',
            'checks': {}
          }
        }
      ],
      'aggregations': {},
      'highlight': {}
    }
  }
})

const menuLib = __non_webpack_require__( '/lib/ssb/menu')
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
    },
    {
      'title': 'Innrapportering',
      'path': 'https://www.ssb.no/innrapportering'
    },
    {
      'title': 'Vi bruker cookies',
      'path': 'https://www.ssb.no/omssb/personvern'
    }
  ], result, 'Checking top links')
}
