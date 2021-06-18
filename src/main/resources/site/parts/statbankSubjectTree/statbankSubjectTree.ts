import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { SubjectItem, StatisticItem } from '../../../lib/ssb/utils/subjectUtils'
import { Content, QueryResponse } from 'enonic-types/content'
import { Statistics } from '../../content-types/statistics/statistics'
import { Component } from 'enonic-types/portal'
import { StatbankSubjectTreePartConfig } from './statbankSubjectTree-part-config'
import { StatisticInListing } from '../../../lib/ssb/dashboard/statreg/types'
const {
  getMainSubjects,
  getSubSubjects,
  getSubSubjectsByPath,
  getEndedStatisticsByPath
} = __non_webpack_require__( '/lib/ssb/utils/subjectUtils')
const {
  getAllStatisticsFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  query
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent,
  getComponent,
  processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  ensureArray
} = __non_webpack_require__('/lib/ssb/utils/arrayUtils')

export function get(req: Request): React4xpResponse {
  const isNotInEditMode: boolean = req.mode !== 'edit'
  const content: Content = getContent()
  const component: Component<StatbankSubjectTreePartConfig> = getComponent()
  const language: string = content.language === 'en' ? 'en' : 'no'
  const allMainSubjects: Array<SubjectItem> = getMainSubjects(content.language)
  const allSubSubjects: Array<SubjectItem> = getSubSubjects()
  const statregStatistics: Array<StatisticInListing> = ensureArray(getAllStatisticsFromRepo())
  const statbankBaseUrl: string = content.language && content.language === 'en' ? '/en/statbank/list/' : '/statbank/list/'
  const mainSubjects: Array<MainSubjectWithSubs> = allMainSubjects.map( (subjectItem) => {
    const subSubjectsFromPath: Array<SubjectItem> = getSubSubjectsByPath(allSubSubjects, subjectItem.path)
    const preparedSubSubjects: Array<SubSubjectsWithStatistics> = subSubjectsFromPath.map((subSubject) =>
      prepareSubSubjects(subSubject, statregStatistics, language))
    return {
      ...subjectItem,
      subSubjects: preparedSubSubjects
    }
  })

  const props: ReactProps = {
    statbankBaseUrl,
    mainSubjects,
    title: content.displayName,
    preface: component.config.preface ? processHtml({
      value: component.config.preface
    }) : ''
  }
  return React4xp.render('site/parts/statbankSubjectTree/statbankSubjectTree', props, req, {
    clientRender: isNotInEditMode
  })
}

function prepareSubSubjects(subSubject: SubjectItem,
  statregStatistics: Array<StatisticInListing>,
  language: string): SubSubjectsWithStatistics {
  const content: QueryResponse<Statistics> = query({
    count: 20,
    query: `_path LIKE '/content${subSubject.path}/*' AND data.hideFromList != 'true'`,
    contentTypes: [`${app.name}:statistics`]
  })

  const preparedStatistics: PreparedSubs['statistics'] = []
  content.hits.forEach((c) => {
    const stat: StatisticInListing | undefined = c.data.statistic ? statregStatistics.find((s) =>
      s.id.toString() === c.data.statistic) : undefined

    if (stat) {
      preparedStatistics.push(
        {
          title: language === 'en' ? stat.nameEN : stat.name,
          url: stat.shortName
        }
      )
    }
  })

  // TODO:Add ended statistics to english site
  const endedStatistics: Array<StatisticItem> = getEndedStatisticsByPath(subSubject.path, statregStatistics, true)
  const preparedEndedStatistics: PreparedSubs['statistics'] = endedStatistics.length > 0 ? endedStatistics.map((e) => {
    const lang: string = language === 'en' ? 'en' : 'no'
    const title: string = e.titles.filter((t)=> t.language === lang)[0].title
    return {
      title: title,
      url: e.shortName
    }
  }) : []


  return {
    ...subSubject,
    statistics: [...preparedStatistics, ...preparedEndedStatistics]
  }
}

type MainSubjectWithSubs = SubjectItem & SubSubs

type SubSubjectsWithStatistics = SubjectItem & PreparedSubs

interface SubSubs {
  subSubjects: Array<PreparedSubs>;
}

interface PreparedSubs {
  statistics: Array<{title: string; url: string}>;
}

interface ReactProps {
  statbankBaseUrl: string;
  mainSubjects: Array<MainSubjectWithSubs>;
  title: string;
  preface: string;
}
