import {render, ResourceKey} from '/lib/thymeleaf'
import {getMainSubjects, SubjectItem} from '../../../lib/ssb/utils/subjectUtils'
import {parseContributions} from '../../../lib/ssb/utils/utils'
import {DropdownItems} from '../../../lib/types/components'
// import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
import {render as r4XpRender, RenderResponse} from '/lib/enonic/react4xp'

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


const view: ResourceKey = resolve('./bestbet.html')


exports.get = function(req: XP.Request): RenderResponse | XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request): RenderResponse | XP.Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request): RenderResponse | XP.Response {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const DEFAULT_CONTENTSTUDIO_URL: string = getToolUrl('com.enonic.app.contentstudio', 'main')
  const ENONIC_PROJECT_ID: string = app.config && app.config['ssb.project.id'] ? app.config['ssb.project.id'] : 'default'

  // Main subjects and content types must be translated in frontend since it can't be based off of the app's language
  const mainSubjects: Array<SubjectItem> = getMainSubjects(req, 'nb')
  const mainSubjectsEnglish: Array<SubjectItem> = getMainSubjects(req, 'en')

  const mainSubjectsList: Array<{id: string; title: string}> = mainSubjects.map((subject) => {
    return {
      id: subject.name,
      title: subject.title
    }
  })

  const mainSubjectsListEnglish: Array<{id: string; title: string}> = mainSubjectsEnglish.map((subject) => {
    return {
      id: subject.name,
      title: subject.title
    }
  })
  const mainSubjectDropdownItems: DropdownItems = [{
    id: '',
    title: 'Velg emne'
  }, ...mainSubjectsList]

  const englishMainSubjectDropdownItems: DropdownItems = [{
    id: '',
    title: 'Velg engelsk emne'
  }, ...mainSubjectsListEnglish]

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

  const bestbetComponent: RenderResponse = r4XpRender(
       'bestbet/Bestbet'
      ,{
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
        mainSubjects: mainSubjectDropdownItems,
        mainSubjectsEnglish: englishMainSubjectDropdownItems
      }
  )
    .setId('app-bestbet')

  const pageContributions: XP.PageContributions = parseContributions(bestbetComponent.renderPageContributions({
    clientRender: req.mode !== 'edit'
  }) as XP.PageContributions)

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
