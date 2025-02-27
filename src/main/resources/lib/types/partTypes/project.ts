export interface ProjectProps {
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

export interface ManagerLink {
  text: string
  href: string
}
