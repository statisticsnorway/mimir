import { Request } from 'enonic-types/controller'
import { Component, PortalLibrary } from 'enonic-types/portal'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { NameSearchPartConfig } from './nameSearch-part-config'
import { I18nLibrary } from 'enonic-types/i18n'


const {
  getComponent, getContent, pageUrl
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')

const {
  serviceUrl
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')
const {
  getLanguageShortName
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  localize
}: I18nLibrary = __non_webpack_require__('/lib/xp/i18n')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')


exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const component: Component<NameSearchPartConfig> = getComponent()
  const locale: string = getLanguageShortName(getContent())

  const urlToService: string = serviceUrl({
    service: 'nameSearch'
  })

  const props: PartProperties = {
    urlToService: urlToService,
    aboutLink: aboutLinkResources(component.config),
    phrases: partsPhrases(locale)
  }

  return React4xp.render(component, props, req)
}


function aboutLinkResources(config: Component<NameSearchPartConfig>['config']): PartProperties['aboutLink'] | undefined {
  if (config.aboutLinkTitle && config.aboutLinkTarget) {
    return {
      title: config.aboutLinkTitle,
      url: pageUrl({
        id: config.aboutLinkTarget
      })
    }
  }
  return undefined
}

function partsPhrases(locale: string): PartProperties['phrases'] {
  return {
    nameSearchTitle: localize({
      key: 'nameSearch.title',
      locale
    }),
    nameSearchInputLabel: localize({
      key: 'nameSearch.inputLabel',
      locale
    }),
    nameSearchButtonText: localize({
      key: 'nameSearch.buttonText',
      locale
    }),
    interestingFacts: localize({
      key: 'nameSearch.interestingFacts',
      locale
    }),
    nameSearchResultTitle: localize({
      key: 'nameSearch.resultTitle',
      locale
    }),
    thereAre: localize({
      key: 'nameSearch.thereAre',
      locale
    }),
    with: localize({
      key: 'nameSearch.with',
      locale
    }),
    asTheir: localize({
      key: 'nameSearch.asTheir',
      locale
    }),
    errorMessage: localize({
      key: 'nameSearch.errorMessage',
      locale
    }),
    threeOrLessText: localize({
      key: 'nameSearch.threeOrLessText',
      locale
    }),
    women: localize({
      key: 'women',
      locale
    }),
    men: localize({
      key: 'men',
      locale
    }),
    types: {
      firstgivenandfamily: localize({
        key: 'nameSearch.types.firstgivenandfamily',
        locale
      }),
      middleandfamily: localize({
        key: 'nameSearch.types.middleandfamily',
        locale
      }),
      family: localize({
        key: 'nameSearch.types.family',
        locale
      }),
      onlygiven: localize({
        key: 'nameSearch.types.onlygiven',
        locale
      }),
      onlygivenandfamily: localize({
        key: 'nameSearch.types.onlygivenandfamily',
        locale
      }),
      firstgiven: localize({
        key: 'nameSearch.types.firstgiven',
        locale
      })
    }
  }
}

interface PartProperties {
  urlToService: string;
  aboutLink?: {
    title: string;
    url: string;
  };
  phrases: {
    nameSearchTitle: string;
    nameSearchInputLabel: string;
    nameSearchButtonText: string;
    interestingFacts: string;
    nameSearchResultTitle: string;
    thereAre: string;
    with: string;
    asTheir: string;
    errorMessage: string;
    threeOrLessText: string;
    women: string;
    men: string;
    types: {
      firstgivenandfamily: string;
      middleandfamily: string;
      family: string;
      onlygiven: string;
      onlygivenandfamily: string;
      firstgiven: string;
    };
  };
}
