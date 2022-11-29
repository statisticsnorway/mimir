import type { Component } from '/lib/xp/portal'
import { render, type RenderResponse } from '/lib/enonic/react4xp'
import type { Content } from '/lib/xp/content'
import { PublicationArchive as PublicationArchivePartConfig } from '.'
import type { PublicationResult } from '../../../lib/ssb/parts/publicationArchive'
import type { SubjectItem } from '../../../lib/ssb/utils/subjectUtils'
import { getContent, getComponent, serviceUrl } from '/lib/xp/portal'

const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')
const { getPublications } = __non_webpack_require__('/lib/ssb/parts/publicationArchive')
const { getMainSubjects } = __non_webpack_require__('/lib/ssb/utils/subjectUtils')

export function get(req: XP.Request): RenderResponse {
  return renderPart(req)
}

export function preview(req: XP.Request): RenderResponse {
  return renderPart(req)
}

function renderPart(req: XP.Request): RenderResponse {
  const content: Content = getContent()
  const part: Component<PublicationArchivePartConfig> = getComponent()
  const phrases: { [key: string]: string } = getPhrases(content)
  const language: string = content.language ? content.language : 'nb'
  const publicationArchiveServiceUrl: string = serviceUrl({
    service: 'publicationArchive',
  })
  const mainSubjects: Array<SubjectItem> = getMainSubjects(req, language)
  const start = 0
  const count = 10

  const mainSubjectDropdown: Array<Dropdown> = [
    {
      id: '',
      title: phrases['publicationArchive.allSubjects'],
    },
  ].concat(
    mainSubjects.map((subject) => {
      return {
        id: subject.name,
        title: subject.title,
      }
    })
  )

  const articleTypeDropdown: Array<Dropdown> = [
    {
      id: '',
      title: phrases['publicationArchive.allTypes'],
    },
    {
      id: 'default',
      title: phrases['articleType.default'],
    },
    {
      id: 'report',
      title: phrases['articleType.report'],
    },
    {
      id: 'note',
      title: phrases['articleType.note'],
    },
    {
      id: 'analysis',
      title: phrases['articleType.analysis'],
    },
    {
      id: 'economicTrends',
      title: phrases['articleType.economicTrends'],
    },
    {
      id: 'discussionPaper',
      title: phrases['articleType.discussionPaper'],
    },
    {
      id: 'statistics',
      title: phrases['articleType.statistics'],
    },
  ]

  const props: PartProperties = {
    title: content.displayName,
    ingress: part.config.ingress || '',
    buttonTitle: phrases['button.showMore'],
    showingPhrase: phrases['publicationArchive.showing'],
    defineContentPhrase: phrases['publicationArchive.defineContent'],
    chooseSubjectPhrase: phrases['dropdown.chooseSubject'],
    chooseContentTypePhrase: phrases['dropdown.chooseContenttype'],
    language,
    publicationArchiveServiceUrl,
    firstPublications: getPublications(req, start, count, language),
    articleTypePhrases: {
      default: phrases['articleType.default'],
      report: phrases['articleType.report'],
      note: phrases['articleType.note'],
      analysis: phrases['articleType.analysis'],
      economicTrends: phrases['articleType.economicTrends'],
      discussionPaper: phrases['articleType.discussionPaper'],
      statistics: phrases['articleType.statistics'],
    },
    dropDownSubjects: mainSubjectDropdown,
    dropDownTypes: articleTypeDropdown,
  }

  return render('site/parts/publicationArchive/publicationArchive', props, req)
}

interface PartProperties {
  title: string
  ingress: string
  buttonTitle: string
  showingPhrase: string
  defineContentPhrase: string
  chooseSubjectPhrase: string
  chooseContentTypePhrase: string
  language: string
  publicationArchiveServiceUrl: string
  firstPublications: PublicationResult
  articleTypePhrases: {
    [key: string]: string
  }
  dropDownSubjects: Array<Dropdown>
  dropDownTypes: Array<Dropdown>
}

interface Dropdown {
  id: string
  title: string
}
