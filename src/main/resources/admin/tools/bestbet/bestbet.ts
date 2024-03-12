import { type ResourceKey } from '@enonic-types/core'
import { assetUrl, serviceUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { getToolUrl } from '/lib/xp/admin'
import { render } from '/lib/thymeleaf'
import { getMainSubjects, type SubjectItem } from '/lib/ssb/utils/subjectUtils'
import { parseContributions } from '/lib/ssb/utils/utils'
import { type DropdownItems } from '/lib/types/components'
import { render as r4XpRender } from '/lib/enonic/react4xp'

import { renderError } from '/lib/ssb/error/error'

const view: ResourceKey = resolve('./bestbet.html')

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export const preview = (req: XP.Request): XP.Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request): XP.Response {
  const DEFAULT_CONTENTSTUDIO_URL = getToolUrl('com.enonic.app.contentstudio', 'main')
  const ENONIC_PROJECT_ID: string =
    app.config && app.config['ssb.project.id'] ? app.config['ssb.project.id'] : 'default'

  // Main subjects and content types must be translated in frontend since it can't be based off of the app's language
  const mainSubjects: Array<SubjectItem> = getMainSubjects(req, 'nb')
  const mainSubjectsEnglish: Array<SubjectItem> = getMainSubjects(req, 'en')

  const mainSubjectsList: Array<{ id: string; title: string }> = mainSubjects.map((subject) => {
    return {
      id: subject.name,
      title: subject.title,
    }
  })

  const mainSubjectsListEnglish: Array<{ id: string; title: string }> = mainSubjectsEnglish.map((subject) => {
    return {
      id: subject.name,
      title: subject.title,
    }
  })
  const mainSubjectDropdownItems: DropdownItems = [
    {
      id: '',
      title: 'Velg emne',
    },
    ...mainSubjectsList,
  ]

  const englishMainSubjectDropdownItems: DropdownItems = [
    {
      id: '',
      title: 'Velg engelsk emne',
    },
    ...mainSubjectsListEnglish,
  ]

  const validContentTypes: Array<string> = [
    'artikkel',
    'statistikk',
    'faktaside',
    'statistikkbanktabell',
    'publikasjon',
  ]
  const contentTypesList: Array<{ id: string; title: string }> = validContentTypes.map((contentType: string) => {
    return {
      id: contentType,
      title: localize({
        key: `contentType.search.${contentType}`,
        locale: 'nb',
      }),
    }
  })
  const contentTypesDropdownItems: DropdownItems = [
    {
      id: '',
      title: 'Velg innholdstype',
    },
    ...contentTypesList,
  ]

  const bestBetComponent = r4XpRender(
    'Bestbet',
    {
      logoUrl: assetUrl({
        path: 'SSB_logo_black.svg',
      }),
      bestBetListServiceUrl: serviceUrl({
        service: 'bestBetList',
      }),
      contentSearchServiceUrl: serviceUrl({
        service: 'contentSearch',
      }),
      contentStudioBaseUrl: `${DEFAULT_CONTENTSTUDIO_URL}/${ENONIC_PROJECT_ID}/edit/`,
      contentTypes: contentTypesDropdownItems,
      mainSubjects: mainSubjectDropdownItems,
      mainSubjectsEnglish: englishMainSubjectDropdownItems,
    },
    req,
    {
      id: 'app-bestbet',
    }
  )

  return {
    body: render(view, {
      ...getAssets(),
      pageContributions: parseContributions(bestBetComponent.pageContributions),
    }),
  }
}

function getAssets(): object {
  return {
    jsLibsUrl: assetUrl({
      path: 'js/bundle.js',
    }),
    stylesUrl: assetUrl({
      path: 'styles/bundle.css',
    }),
    wsServiceUrl: serviceUrl({
      service: 'websocket',
    }),
  }
}
