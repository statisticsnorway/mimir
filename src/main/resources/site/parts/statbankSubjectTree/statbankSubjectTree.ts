import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { SubjectItem } from '../../../lib/ssb/utils/subjectUtils'
import { Content, QueryResponse } from 'enonic-types/content'
import { Statistics } from '../../content-types/statistics/statistics'
import { Component } from 'enonic-types/portal'
import { StatbankSubjectTreePartConfig } from './statbankSubjectTree-part-config'
const {
  getMainSubjects,
  getSubSubjects,
  getSubSubjectsByPath
} = __non_webpack_require__( '/lib/ssb/utils/subjectUtils')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  query
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent,
  getComponent,
  processHtml
} = __non_webpack_require__('/lib/xp/portal')

export function get(req: Request): React4xpResponse {
  const isNotInEditMode: boolean = req.mode !== 'edit'
  const content: Content = getContent()
  const component: Component<StatbankSubjectTreePartConfig> = getComponent()
  const allMainSubjects: Array<SubjectItem> = getMainSubjects(content.language)
  const allSubSubjects: Array<SubjectItem> = getSubSubjects()
  const mainSubjects: Array<MainSubjectWithSubs> = allMainSubjects.map( (subjectItem) => {
    const subSubjectsFromPath: Array<SubjectItem> = getSubSubjectsByPath(allSubSubjects, subjectItem.path)
    const preparedSubSubjects: Array<SubSubjectsWithStatistics> = subSubjectsFromPath.map((subSubject) =>
      prepareSubSubjects(subSubject))
    return {
      ...subjectItem,
      subSubjects: preparedSubSubjects
    }
  })

  const props: ReactProps = {
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

function prepareSubSubjects(subSubject: SubjectItem): SubSubjectsWithStatistics {
  const content: QueryResponse<Statistics> = query({
    count: 20,
    query: `_path LIKE '/content${subSubject.path}/*' AND data.hideFromList != 'true'`,
    contentTypes: [`${app.name}:statistics`]
  })

  const preparedStatistics: PreparedSubs['statistics'] = content.hits.map((c) => ({
    title: c.displayName,
    url: c.data.statistic ? c.data.statistic : ''
  }))

  return {
    ...subSubject,
    statistics: preparedStatistics
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
  mainSubjects: Array<MainSubjectWithSubs>;
  title: string;
  preface: string;
}
