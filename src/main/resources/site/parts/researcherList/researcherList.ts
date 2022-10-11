import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content, QueryResponse } from 'enonic-types/content'
import { Employee } from '../../content-types/employee/employee'
import { DefaultPageConfig } from '../../pages/default/default-page-config'

const {
  getContent, pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  get, query
} = __non_webpack_require__('/lib/xp/content')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const content: Content = getContent()
  const language: string = content.language ? content.language : 'nb'

  const queryResults: QueryResponse<Employee> = getResearchers()
  const preparedResults: Array<IPreparedResearcher> = prepareResearchers(queryResults.hits)
  const alphabeticalResearchersList: Array<IResearcherMap> = createAlphabeticalResearchersList(preparedResults)

  const pageHeadingPhrase: string = localize({
    key: 'researcherList.pageHeading',
    locale: language
  })

  const pageDescriptionPhrase: string = localize({
    key: 'researcherList.pageDescription',
    locale: language
  })

  const props: IPartProps = {
    researchers: alphabeticalResearchersList,
    total: queryResults.total,
    pageHeadingPhrase,
    pageDescriptionPhrase
  }

  return React4xp.render('site/parts/researcherList/researcherList', props, req)
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
              values: [true]
            }
          }
        ]
      }
    },
    contentTypes: [
      `${app.name}:employee`
    ]
  })
}

function prepareResearchers(results: readonly Content<Employee>[]) {
  return results.map((result) => {
    const areaContent: Content<DefaultPageConfig> | null = result.data.area ? get({
      key: result.data.area
    }) : null

    const area: Area| null = areaContent ? {
      title: areaContent.displayName,
      href: areaContent._path
    } : null

    return {
      surname: result.data.surname || '',
      name: result.data.name || '',
      position: result.data.position || '',
      path: pageUrl({
        id: result._id
      }),
      phone: result.data.phone || '',
      email: result.data.email || '',
      area: area || ''
    }
  })
}

function createAlphabeticalResearchersList(preparedResults: IPreparedResearcher[]):Array<IResearcherMap> {
  const data: IObjectKeys = preparedResults.reduce((result: IObjectKeys, researcher: IPreparedResearcher) => {
    const alphabet: string = researcher.surname[0].toUpperCase()
    if (!result[alphabet]) {
      result[alphabet] = {
        alphabet,
        record: [researcher]
      }
    } else {
      result[alphabet].record.push(researcher)
    }
    return result
  }, {
  })

  const result: Array<IResearcherMap> = Object.keys(data).map((key) => data[key])
  return result
}

interface IPartProps {
  researchers: IResearcherMap[],
  total: number,
  pageHeadingPhrase: string,
  pageDescriptionPhrase: string
}

interface IPreparedResearcher {
  surname: string,
  name: string,
  position: string,
  path: string,
  phone: string,
  email: string,
  area: string | Area
}

interface Area {
  href: string;
  title: string;
}

interface IObjectKeys {
  [key: string]: IResearcherMap;
}

interface IResearcherMap {
  alphabet: string;
  record: IPreparedResearcher[]
}
