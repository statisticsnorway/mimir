import { type Content, get as getTheContent } from '/lib/xp/content'
import { localize } from '/lib/xp/i18n'
import { getContent, pageUrl, processHtml } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { type Project } from '/site/content-types'

export function preview(req: XP.Request) {
  return renderPart(req)
}

export function get(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const page = getContent<Content<Project>>()
  if (!page) throw Error('No page found')

  const managerConfig: string | undefined = page.data.manager || undefined
  const language: string = page.language ? page.language : 'nb'

  const projectManagerPhrase: string = localize({
    key: 'project.projectManager',
    locale: language,
  })

  const modelManagerPhrase: string = localize({
    key: 'project.modelManager',
    locale: language,
  })

  const periodPhrase: string = localize({
    key: 'project.period',
    locale: language,
  })

  const financierPhrase: string = localize({
    key: 'project.financier',
    locale: language,
  })

  const aboutModelPhrase: string = localize({
    key: 'project.aboutModel',
    locale: language,
  })
  const aboutProjectPhrase: string = localize({
    key: 'project.aboutProject',
    locale: language,
  })

  const participantsPhrase: string = localize({
    key: 'project.participants',
    locale: language,
  })

  const projectParticipantsPhrase: string = localize({
    key: 'project.projectParticipants',
    locale: language,
  })

  const collaboratorsPhrase: string = localize({
    key: 'project.collaborators',
    locale: language,
  })

  const modelPhrase: string = localize({
    key: 'project.model',
    locale: language,
  })

  const projectPhrase: string = localize({
    key: 'project.projectPhrase',
    locale: language,
  })

  const props: ProjectProps = {
    introTitle: page.data.projectType === 'model' ? modelPhrase : projectPhrase,
    projectTitle: page.displayName || undefined,
    manager: getManager(managerConfig),
    projectType: page.data.projectType === 'model' ? modelManagerPhrase : projectManagerPhrase,
    projectPeriod: page.data.projectPeriod || undefined,
    financier: page.data.financier,
    heading: page.data.projectType === 'model' ? aboutModelPhrase : aboutProjectPhrase,
    ingress: page.data.ingress
      ? processHtml({
          value: page.data.ingress,
        })
      : undefined,
    body: page.data.body
      ? processHtml({
          value: page.data.body,
        })
      : undefined,
    participants: page.data.participants
      ? processHtml({
          value: page.data.participants,
        })
      : undefined,
    collaborators: page.data.collaborators
      ? processHtml({
          value: page.data.collaborators,
        })
      : undefined,
    periodPhrase,
    financierPhrase,
    participantsPhrase,
    projectParticipantsPhrase,
    collaboratorsPhrase,
  }

  return render('site/parts/project/project', props, req)
}

function getManager(managerId?: string | undefined): ManagerLink | undefined {
  if (managerId) {
    const managerContent: Content | null = getTheContent({
      key: managerId,
    })
    if (managerContent) {
      return {
        text: managerContent.displayName,
        href: pageUrl({
          path: managerContent._path,
        }),
      }
    }
  }
  return undefined
}

interface ManagerLink {
  text: string
  href: string
}

interface ProjectProps {
  introTitle?: string
  projectTitle?: string
  manager?: ManagerLink
  projectType?: string
  projectPeriod?: string
  financier?: string
  heading?: string
  ingress?: string
  body?: string
  participants?: string
  collaborators?: string
  periodPhrase?: string
  financierPhrase?: string
  participantsPhrase?: string
  projectParticipantsPhrase?: string
  collaboratorsPhrase?: string
}
