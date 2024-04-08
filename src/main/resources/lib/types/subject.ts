export interface SubjectItem {
  id: string
  title: string
  subjectCode?: string
  path: string
  language: string
  name: string
}

export interface MainSubject {
  subjectCode: string
  name: string
  titles: Array<Title>
  subSubjects: Array<SubSubject>
}

export interface SubSubject {
  id: string
  subjectCode: string
  name: string
  titles: Array<Title>
  statistics: Array<StatisticItem>
}

export interface Title {
  title: string
  language: string
}

export interface StatisticItem {
  path: string
  language: string
  shortName: string
  isPrimaryLocated: boolean
  titles: Array<Title>
  hideFromList: boolean
  secondarySubject: Array<string>
}

export interface EndedStatistic {
  statistic?: string
  hideFromList: boolean
}
