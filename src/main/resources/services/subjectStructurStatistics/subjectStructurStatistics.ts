import { Response } from 'enonic-types/controller'
import { MainSubject,
  SubjectItem,
  SubSubject,
  Title,
  StatisticItem } from '../../lib/ssb/utils/subjectUtils'
const {
  getMainSubjects,
  getSubSubjects,
  getStatistics,
  getMainSubjectsByLanguage,
  getTitlesSubjectByName,
  getSubSubjectsByMainSubjectPath
} = __non_webpack_require__('/lib/ssb/utils/subjectUtils')

function get(): Response {
  const mainSubjectsAll: Array<SubjectItem> = getMainSubjects()
  const mainSubjectsNorwegian: Array<SubjectItem> = getMainSubjectsByLanguage(mainSubjectsAll, 'no')
  const subSubjectsAll: Array<SubjectItem> = getSubSubjects()
  const statistics: Array<StatisticItem> = getStatistics()

  const mainSubjects: Array<MainSubject> = mainSubjectsNorwegian.map((m) => {
    const titles: Array<Title> | null = getTitlesSubjectByName(mainSubjectsAll, m.name)
    const subSubjects: Array<SubSubject> = getSubSubjectsByMainSubjectPath(subSubjectsAll, statistics, m.path)

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
        ${[...mainSubjects].map((m: MainSubject) =>
    `<hovedemne emnekode="${m.subjectCode}">${getXmlTitle(m.titles)}${m.subSubjects.map((s: SubSubject) =>
      `<delemne emnekode="${s.code}">${getXmlTitle(s.titles)} ${s.statistics.map((stat: StatisticItem) =>
        `<Statistikk kortnavn="${stat.shortName}" isPrimaerPlassering="${stat.isPrimaryLocated}">${getXmlTitle(stat.titles)}</Statistikk>`)}        
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

function getXmlTitle(titles: Array<Title>): string {
  return `<titler>${titles.map((st: Title) => `<tittel sprak="${st.language}">${st.title}</tittel>`)}</titler>`
}
