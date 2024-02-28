import { Statistics } from '/site/content-types/statistics'

export interface StatbankLinkListModel {
  title: string
  statbankLinks: Statistics['statbankLinkItemSet']
}
