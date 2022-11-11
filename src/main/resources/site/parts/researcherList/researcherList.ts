import { Content, QueryResponse, get, query } from '/lib/xp/content'
import type { Employee } from '../../content-types'
import type { Default as DefaultPageConfig } from '../../pages/default'
import { getContent, pageUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { RenderResponse, render } from '/lib/enonic/react4xp'
import type { Page } from '../../content-types'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

exports.get = (req: XP.Request): RenderResponse | XP.Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request): RenderResponse => renderPart(req)

function renderPart(req: XP.Request): RenderResponse {
  const content: Content<Page, object> = getContent()
  const language: string = content.language ? content.language : 'nb'

  const queryResults: QueryResponse<Employee, object> = getResearchers()
  const preparedResults: Array<IPreparedResearcher> = prepareResearchers(queryResults.hits)
  const alphabeticalResearchersList: Array<IResearcherMap> = createAlphabeticalResearchersList(preparedResults)

  const pageHeadingPhrase: string = localize({
    key: 'researcherList.pageHeading',
    locale: language,
  })

  const pageDescriptionPhrase: string = localize({
    key: 'researcherList.pageDescription',
    locale: language,
  })

  const props: IPartProps = {
    researchers: alphabeticalResearchersList,
    total: queryResults.total,
    pageHeadingPhrase,
    pageDescriptionPhrase,
  }

  return render('site/parts/researcherList/researcherList', props, req)
}

function getResearchers() {
  return query<Employee>({
    start: 0,
    count: 500,
    sort: 'data.surname ASC',
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'data.isResearcher',
              values: [true],
            },
          },
        ],
      },
    },
    contentTypes: [`${app.name}:employee`],
  })
}

function prepareResearchers(results: readonly Content<Employee>[]) {
  return results.map((result) => {
    const areaContent: Content<DefaultPageConfig> | null = result.data.area
      ? get({
          key: result.data.area,
        })
      : null

    const area: Area | null = areaContent
      ? {
          title: areaContent.displayName,
          href: areaContent._path,
        }
      : null

    return {
      surname: result.data.surname || '',
      name: result.data.name || '',
      position: result.data.position || '',
      path: pageUrl({
        id: result._id,
      }),
      phone: result.data.phone || '',
      email: result.data.email || '',
      area: area || '',
    }
  })
}

function createAlphabeticalResearchersList(preparedResults: IPreparedResearcher[]): Array<IResearcherMap> {
  const data: IObjectKeys = preparedResults.reduce((result: IObjectKeys, researcher: IPreparedResearcher) => {
    const alphabet: string = researcher.surname[0].toUpperCase()
    if (!result[alphabet]) {
      result[alphabet] = {
        alphabet,
        record: [researcher],
      }
    } else {
      result[alphabet].record.push(researcher)
    }
    return result
  }, {})

  const result: Array<IResearcherMap> = Object.keys(data).map((key) => data[key])
  return result
}

interface IPartProps {
  researchers: IResearcherMap[]
  total: number
  pageHeadingPhrase: string
  pageDescriptionPhrase: string
}

interface IPreparedResearcher {
  surname: string
  name: string
  position: string
  path: string
  phone: string
  email: string
  area: string | Area
}

interface Area {
  href: string
  title: string
}

interface IObjectKeys {
  [key: string]: IResearcherMap
}

interface IResearcherMap {
  alphabet: string
  record: IPreparedResearcher[]
}
