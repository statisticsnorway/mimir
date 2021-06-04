import { Response } from 'enonic-types/controller'
import { SubjectUtilsLib,
  MainSubject,
  SubjectItem,
  SubSubject,
  Title } from '../../lib/ssb/utils/subjectUtils'
const {
  getMainSubjects,
  getSubSubjects,
  getMainSubjectsByLanguage,
  getTitlesSubjectByName,
  getSubSubjectsByMainSubjectPath
}: SubjectUtilsLib = __non_webpack_require__('/lib/ssb/utils/subjectUtils')

function get(): Response {
  const mainSubjectsAll: Array<SubjectItem> = getMainSubjects()
  const mainSubjectsNorwegian: Array<SubjectItem> = getMainSubjectsByLanguage(mainSubjectsAll, 'no')

  const subSubjectsAll: Array<SubjectItem> = getSubSubjects()

  const mainSubjects: Array<MainSubject> = mainSubjectsNorwegian.map((m) => {
    const titles: Array<Title> | null = getTitlesSubjectByName(mainSubjectsAll, m.name)
    const subSubjects: Array<SubSubject> = getSubSubjectsByMainSubjectPath(subSubjectsAll, m.path)

    return {
      subjectCode: m.subjectCode ? m.subjectCode : '',
      name: m.name,
      titles: titles ? titles : [],
      subSubjects: subSubjects
    }
  })

  const xml: string =
  `<?xml version="1.0" encoding="utf-8"?>
  <result>
    <emnestruktur>
        ${[...mainSubjects].map((m: MainSubject) =>`<hovedemne emnekode="${m.subjectCode}">
        <titler>
        ${m.titles.map((t: Title) => `<tittel sprak="${t.language}">${t.title}</tittel>`)}
        </titler>
        ${m.subSubjects.map((s: SubSubject) => `<delemne emnekode="${s.code}">
        ${s.titles.map((t: Title) => `<tittel sprak="${t.language}">${t.title}</tittel>`)}
        </delemne>`)}
        </hovedemne>`).join('')}
    </emnestruktur>
  </result>`

  return {
    body: xml,
    contentType: 'text/xml'
  }
}

exports.get = get

