import { Response } from 'enonic-types/controller'
import { SubjectUtilsLib,
  MainSubjectItem,
  MainSubject,
  Title,
  getMainSubjectsByLanguage,
  getMainSubjectByNameAndLanguage } from '../../lib/ssb/utils/subjectUtils'
const {
  getMainSubjects
}: SubjectUtilsLib = __non_webpack_require__('/lib/ssb/utils/subjectUtils')

function get(): Response {
  const mainSubjectsAll: Array<MainSubjectItem> = getMainSubjects()
  const mainSubjectsNorwegian: Array<MainSubjectItem> = getMainSubjectsByLanguage(mainSubjectsAll, 'no')

  const mainSubjects: Array<MainSubject> = mainSubjectsNorwegian.map((m) => {
    const mainSubjectEnglish: MainSubjectItem | null = getMainSubjectByNameAndLanguage(mainSubjectsAll, 'en', m.name)
    const titles: Array<Title> = [
      {
        title: m.title ? m.title : '',
        language: 'no'
      },
      {
        title: mainSubjectEnglish ? mainSubjectEnglish.title : '',
        language: 'en'
      }
    ]

    return {
      subjectCode: m.subjectCode ? m.subjectCode : '',
      name: m.name,
      titles: titles
    }
  })

  const xml: string =
  `<?xml version="1.0" encoding="utf-8"?>
  <result>
    <emnestruktur>
        ${[...mainSubjects].map((m: MainSubject) =>`<hovedemne emnekode="${m.subjectCode}">
        <titler>
        ${m.titles.map((t: Title) => `<title sprak="${t.language}">${t.title}</title>`)}
        </titler>
        </hovedemne>`).join('')}
    </emnestruktur>
  </result>`

  return {
    body: xml,
    contentType: 'text/xml'
  }
}

exports.get = get

