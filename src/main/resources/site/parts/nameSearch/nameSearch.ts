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
} = __non_webpack_require__('/lib/language')
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
    nameSearchTitle: localize({
      key: 'nameSearchTitle',
      locale
    }),
    nameSearchInputLabel: localize({
      key: 'nameSearchInputLabel',
      locale
    }),
    nameSearchButtonText: localize({
      key: 'nameSearchButtonText',
      locale
    }),
    interestingFacts: localize({
      key: 'interestingFacts',
      locale
    }),
    nameSearchResultTitle: localize({
      key: 'nameSearchResultTitle',
      locale
    }),
    nameSearchResultText: localize({
      key: 'nameSearchResultText',
      locale
    })
  }

  return React4xp.render('site/parts/nameSearch/nameSearch', props, req)
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


interface PartProperties {
  urlToService: string;
  aboutLink?: {
    title: string;
    url: string;
  };
  nameSearchTitle: string;
  nameSearchInputLabel: string;
  nameSearchButtonText: string;
  interestingFacts: string;
  nameSearchResultTitle: string;
  nameSearchResultText: string;
}
