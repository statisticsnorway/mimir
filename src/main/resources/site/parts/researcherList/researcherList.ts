import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content, QueryResponse } from 'enonic-types/content'
import { renderError } from '../../../lib/ssb/error/error'
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

  const results: QueryResponse<Employee> = getResearchers()
  const preparedResults: Array<IPreparedResearcher> = prepareResearchers(results.hits)
  const alphabeticalResearchersList: IResearcherMap = createAlphabeticalResearchersList(preparedResults)

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
    total: results.total,
    pageHeadingPhrase,
    pageDescriptionPhrase
  }

  return React4xp.render('site/parts/researcherList/researcherList', props, req)
}

function getResearchers() {
  return query<Employee>({
    start: 0,
    count: 20,
    sort: 'publish.from DESC',
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
      surname: result.data.surname,
      name: result.data.name,
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

function createAlphabeticalResearchersList(researchers: Array<IPreparedResearcher>) {
  const groupedCollection: IResearcherMap = {}

  for (let i: number = 0; i < researchers.length; i++) {
    const firstLetter: string = researchers[i].surname.charAt(0)

    if (groupedCollection[firstLetter] == undefined) {
      groupedCollection[firstLetter] = []
    }
    groupedCollection[firstLetter]?.push(researchers[i])
  }

  return sortAlphabeticallyAtoZ(groupedCollection)
}

function sortAlphabeticallyAtoZ(list: IResearcherMap) {
  return Object.keys(list)
    .sort()
    .reduce((accumulator: IResearcherMap, key) => {
      accumulator[key] = list[key]
      return accumulator
    }, {})
}

interface IPartProps {
  researchers: IResearcherMap,
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

interface IResearcherMap {
  [key: string]: IPreparedResearcher[] | undefined
}

interface Area {
  href: string;
  title: string;
}
