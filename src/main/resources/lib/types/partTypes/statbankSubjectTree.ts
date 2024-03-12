import { type SubjectItem } from '../subject'

export interface StatbankSubjectTreeProps {
  statbankBaseUrl: string
  mainSubjects: Array<MainSubjectWithSubs>
}

export type MainSubjectWithSubs = SubjectItem & SubSubs

export type SubSubjectsWithStatistics = SubjectItem & PreparedSubs

export interface SubSubs {
  subSubjects: Array<PreparedSubs>
}

export interface PreparedSubs {
  statistics: Array<{ title: string; url: string }>
}
