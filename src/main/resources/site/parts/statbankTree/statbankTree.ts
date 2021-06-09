import { Request, Response } from 'enonic-types/controller'
import { SubjectItem } from '../../../lib/ssb/utils/subjectUtils'
const {
  getMainSubjects,
  getSubSubjectsByPath
} = __non_webpack_require__( '/lib/ssb/utils/subjectUtils')


export function get(req: Request): Response {
  const allMainSubjects: Array<SubjectItem> = getMainSubjects()

  const mainSubbjectsWithSubSubjects: Array<BB> = allMainSubjects.map( (subjectItem) => {
    const c: Array<SubjectItem> = getSubSubjectsByPath(allMainSubjects, subjectItem.path)
    return {
      ...subjectItem,
      subSubjects: c
    }
  })
  log.info(JSON.stringify(mainSubbjectsWithSubSubjects, null, 2))
  return {
    body: ''
  }
}

type BB = SubjectItem & SubSubs
interface SubSubs {
  subSubjects: Array<SubjectItem>;
}
