import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { SubjectItem } from '../../../lib/ssb/utils/subjectUtils'
const {
  getMainSubjects,
  getSubSubjects,
  getSubSubjectsByPath
} = __non_webpack_require__( '/lib/ssb/utils/subjectUtils')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

export function get(req: Request): React4xpResponse {
  const allMainSubjects: Array<SubjectItem> = getMainSubjects()
  const allSubSubjects: Array<SubjectItem> = getSubSubjects()
  const mainSubjects: Array<BB> = allMainSubjects.map( (subjectItem) => {
    const c: Array<SubjectItem> = getSubSubjectsByPath(allSubSubjects, subjectItem.path)
    return {
      ...subjectItem,
      subSubjects: c
    }
  })

  const props = {
    mainSubjects
  }
  return React4xp.render('site/parts/statbankTree/statbankTree', props, req)
}

type BB = SubjectItem & SubSubs
interface SubSubs {
  subSubjects: Array<SubjectItem>;
}
interface ReactProps {
  mainSubjects: Array<BB>
}
