import {type  Content, get as getContentByKey} from '/lib/xp/content'
import {render, type RenderResponse} from '/lib/enonic/react4xp'
import {localize} from '/lib/xp/i18n'
import type {Project} from '../../content-types/project/project'
import {getContent, pageUrl, processHtml} from '/lib/xp/portal'

export function preview(req: XP.Request): RenderResponse {
  return renderPart(req)
}

export function get(req: XP.Request): RenderResponse {
  return renderPart(req)
}

function renderPart(req: XP.Request): RenderResponse {
  const page: Content<Project> = getContent()
  const managerConfig: string | undefined = page.data.manager || undefined
  const language: string = page.language ? page.language : 'nb'

  const projectManagerPhrase: string = localize({
    key: 'project.projectManager',
    locale: language
  })

  const modelManagerPhrase: string = localize({
    key: 'project.modelManager',
    locale: language
  })

  const periodPhrase: string = localize({
    key: 'project.period',
    locale: language
  })

  const financierPhrase: string = localize({
    key: 'project.financier',
    locale: language
  })

  const modelPhrase: string = localize({
    key: 'project.modelPhrase',
    locale: language
  })
  const projectPhrase: string = localize({
    key: 'project.projectPhrase',
    locale: language
  })

  const participantsPhrase: string = localize({
    key: 'project.participants',
    locale: language
  })

  const projectParticipantsPhrase: string = localize({
    key: 'project.projectParticipants',
    locale: language
  })

  const collaboratorsPhrase: string = localize({
    key: 'project.collaborators',
    locale: language
  })

  const props: ProjectProps = {
    introTitle: capitalizeFirstLetter(page.data.introTitle),
    projectTitle: page.displayName || undefined,
    manager: getManager(managerConfig),
    projectType: page.data.projectType === 'model' ? modelManagerPhrase : projectManagerPhrase,
    projectPeriod: page.data.projectPeriod || undefined,
    financier: page.data.financier,
    heading: page.data.projectType === 'model' ? modelPhrase : projectPhrase,
    ingress: page.data.ingress ? processHtml({
      value: page.data.ingress
    }) : undefined,
    body: page.data.body ? processHtml({
      value: page.data.body
    }) : undefined,
    participants: page.data.participants ? processHtml({
      value: page.data.participants
    }) : undefined,
    collaborators: page.data.collaborators ? processHtml({
      value: page.data.collaborators
    }) : undefined,
    periodPhrase,
    financierPhrase,
    participantsPhrase,
    projectParticipantsPhrase,
    collaboratorsPhrase
  }

  return render('site/parts/project/project', props, req)
}

function getManager(managerId?: string | undefined): ManagerLink | undefined {
  if (managerId) {
    const managerContent: Content | null = getContentByKey({
      key: managerId
    })
    if (managerContent) {
      return {
        text: managerContent.displayName,
        href: pageUrl({
          path: managerContent._path
        })
      }
    }
  }
  return undefined
}

function capitalizeFirstLetter(str?: string): string | undefined {
  if (str) {
    const result1: string = str.charAt(0).toUpperCase() + str.slice(1)
    const result2: string = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    return result2
  }
  return undefined
}

interface ManagerLink {
  text: string;
  href: string;
}

interface ProjectProps {
  introTitle?: string;
  projectTitle?: string;
  manager?: ManagerLink;
  projectType?: string;
  projectPeriod?: string;
  financier?: string;
  heading?: string;
  ingress?: string;
  body?: string;
  participants?: string;
  collaborators?: string;
  periodPhrase?: string;
  financierPhrase?: string;
  participantsPhrase?: string;
  projectParticipantsPhrase?: string;
  collaboratorsPhrase?: string;
}
