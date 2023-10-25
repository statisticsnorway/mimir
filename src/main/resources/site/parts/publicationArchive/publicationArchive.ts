import { getContent, getComponent, serviceUrl } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { type PublicationResult, getPublications } from '/lib/ssb/parts/publicationArchive'
import { type SubjectItem, getMainSubjects } from '/lib/ssb/utils/subjectUtils'

import { getPhrases } from '/lib/ssb/utils/language'
import { Phrases } from '/lib/types/language'

export function get(req: XP.Request) {
  return renderPart(req)
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const content = getContent()
  if (!content) throw Error('No content found')

  const part = getComponent<XP.PartComponent.PublicationArchive>()
  if (!part) throw Error('No part found')

  const phrases = getPhrases(content) as Phrases
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
