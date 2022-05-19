import { PageContributions, Request, Response } from 'enonic-types/controller'
import { ResourceKey } from 'enonic-types/thymeleaf'
import { getMainSubjects, SubjectItem } from '../../../lib/ssb/utils/subjectUtils'
import { parseContributions } from '../../../lib/ssb/utils/utils'
import { DropdownItems } from '../../../lib/types/components'
import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'

const {
  assetUrl, serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const {
  getToolUrl
} = __non_webpack_require__('/lib/xp/admin')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')

const view: ResourceKey = resolve('./bestbet.html')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req: Request): React4xpResponse | Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: Request): React4xpResponse | Response {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const DEFAULT_CONTENTSTUDIO_URL: string = getToolUrl('com.enonic.app.contentstudio', 'main')
  const ENONIC_PROJECT_ID: string = app.config && app.config['ssb.project.id'] ? app.config['ssb.project.id'] : 'default'

  // Main subjects and content types must be translated in frontend since it can't be based off of the app's language
  const mainSubjects: Array<SubjectItem> = getMainSubjects(req, 'nb')
  const mainSubjectsList: Array<{id: string; title: string}> = mainSubjects.map((subject) => {
    return {
      id: subject.name,
      title: subject.title
    }
  })
  const mainSubjectDropdownItems: DropdownItems = [{
    id: '',
    title: 'Velg emne'
  }, ...mainSubjectsList]

  const validContentTypes: Array<string> = ['artikkel', 'statistikk', 'faktaside', 'statistikkbanktabell', 'publikasjon']
  const contentTypesList: Array<{id: string; title: string}> = validContentTypes.map((contentType: string) => {
    return {
      id: contentType,
      title: localize({
        key: `contentType.search.${contentType}`,
        locale: 'nb'
      })
    }
  })
  const contentTypesDropdownItems: DropdownItems = [{
    id: '',
    title: 'Velg innholdstype'
  }, ...contentTypesList]

  const bestbetComponent: React4xpObject = new React4xp('bestbet/Bestbet')
    .setProps({
      logoUrl: assetUrl({
        path: 'SSB_logo_black.svg'
      }),
      bestBetListServiceUrl: serviceUrl({
        service: 'bestBetList'
      }),
      contentSearchServiceUrl: serviceUrl({
        service: 'contentSearch'
      }),
      contentStudioBaseUrl: `${DEFAULT_CONTENTSTUDIO_URL}#/${ENONIC_PROJECT_ID}/edit/`,
      contentTypes: contentTypesDropdownItems,
      mainSubjects: mainSubjectDropdownItems
    })
    .setId('app-bestbet')

  const pageContributions: PageContributions = parseContributions(bestbetComponent.renderPageContributions({
    clientRender: req.mode !== 'edit'
  }) as PageContributions)

  return {
    body: bestbetComponent.renderBody({
      body: render(view, {
        ...getAssets(),
        pageContributions,
        clientRender: req.mode !== 'edit'
      })
    }),
    pageContributions
  }
}

function getAssets(): object {
  return {
    jsLibsUrl: assetUrl({
      path: 'js/bundle.js'
    }),
    stylesUrl: assetUrl({
      path: 'styles/bundle.css'
    }),
    wsServiceUrl: serviceUrl({
      service: 'websocket'
    })
  }
}
