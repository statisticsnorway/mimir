// TODO NTR: Må hentes fra en types fil
import { type SubjectItem } from '/lib/ssb/utils/subjectUtils'

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
