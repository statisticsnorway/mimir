import { QueryFilters, RepoCommonLib } from '../../repo/common'
import { StatRegConfigLib } from './config'
import { StatisticInListing,
  Contact,
  KontaktXML,
  Kontakt,
  KontaktNavnType,
  KontaktNavn,
  Publisering,
  Publication,
  PubliseringXML } from './types'
import { StatRegCommonLib } from './common'
import { StatRegRepoLib } from '../../repo/statreg'
import { XmlParser } from '../../types/xmlParser'
import { find } from 'ramda'
import { Socket, SocketEmitter } from '../../types/socket'
import { StatRegContactsLib } from '../../repo/statreg/contacts'
import { StatRegStatisticsLib } from '../../repo/statreg/statistics'
import { StatRegPublicationsLib } from '../../repo/statreg/publications'
import { StatRegLatestFetchInfoNode } from '../../repo/statreg/eventLog'
import { EventLogLib } from '../../repo/eventLog'

const {
  STATISTICS_URL,
  CONTACTS_URL,
  PUBLICATIONS_URL,
  getStatRegBaseUrl
}: StatRegConfigLib = __non_webpack_require__('/lib/ssb/statreg/config')
const {
  fetchStatRegData
}: StatRegCommonLib = __non_webpack_require__('/lib/ssb/statreg/common')
const {
  getNode
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')
const {
  STATREG_NODES,
  setupStatRegRepo,
  toDisplayString
}: StatRegRepoLib = __non_webpack_require__('/lib/repo/statreg')
const {
  STATREG_REPO_CONTACTS_KEY
}: StatRegContactsLib = __non_webpack_require__('/lib/repo/statreg/contacts')
const {
  STATREG_REPO_STATISTICS_KEY
}: StatRegStatisticsLib = __non_webpack_require__('/lib/repo/statreg/statistics')
const {
  STATREG_REPO_PUBLICATIONS_KEY
}: StatRegPublicationsLib = __non_webpack_require__('/lib/repo/statreg/publications')
const {
  EVENT_LOG_REPO, EVENT_LOG_BRANCH
}: EventLogLib = __non_webpack_require__('/lib/repo/eventLog')
const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')

function extractStatistics(payload: string): Array<StatisticInListing> {
  return JSON.parse(payload).statistics
}

export function fetchStatistics(filters: QueryFilters): Array<StatisticInListing> {
  return fetchStatRegData('Statistics', getStatRegBaseUrl() + STATISTICS_URL, filters, extractStatistics)
}

function extractContacts(payload: string): Array<Contact> {
  const kontaktXML: KontaktXML = JSON.parse(xmlParser.parse(payload))
  const kontakter: Array<Kontakt> = kontaktXML.kontakter.kontakt
  return kontakter.map((k) => transformContact(k))
}

export function transformContact(kontakt: Kontakt): Contact {
  const {
    id, telefon: telephone, mobil: mobile, epost: email, navn
  } = kontakt

  const navnNo: KontaktNavnType =
        Array.isArray(navn) ?
          find((n: KontaktNavn) => n['xml:lang'] === 'no')(navn) :
          ''

  return {
    id,
    telephone,
    mobile,
    email,
    name: navnNo && navnNo.content
  } as Contact
}

export function fetchContacts(filters: QueryFilters): Array<Contact> {
  return fetchStatRegData('Contacts', getStatRegBaseUrl() + CONTACTS_URL, filters, extractContacts)
}

export function transformPublication(pub: Publisering): Publication {
  const {
    id, variant, statistikkKortnavn, deskFlyt, endret
  } = pub

  return {
    id,
    variant,
    statisticsKey: statistikkKortnavn,
    status: deskFlyt,
    modifiedTime: endret
  }
}

export function extractPublications(payload: string): Array<Publication> {
  const pubXML: PubliseringXML = JSON.parse(xmlParser.parse(payload))
  const publisering: Array<Publisering> = pubXML.publiseringer.publisering
  return publisering.map((pub) => transformPublication(pub))
}

// TODO: this function has to be extended to fetch all publications (the URL used only pulls the 'upcoming' items!
export function fetchPublications(filters: QueryFilters): Array<Publication> {
  return fetchStatRegData('Publications', getStatRegBaseUrl() + PUBLICATIONS_URL, filters, extractPublications)
}

export function refreshStatRegData(): Array<StatRegStatus> {
  setupStatRegRepo()
  return getStatRegFetchStatuses()
}

export type StatRegLatestFetchInfoNodeType = StatRegLatestFetchInfoNode | readonly StatRegLatestFetchInfoNode[] | null;
export function getStatRegFetchStatuses(): Array<StatRegStatus> {
  return [
    STATREG_REPO_CONTACTS_KEY,
    STATREG_REPO_STATISTICS_KEY,
    STATREG_REPO_PUBLICATIONS_KEY
  ].map(getStatRegStatus)
}

export function getStatRegStatus(key: string): StatRegStatus {
  const eventLogKey: string = `/statreg/${key}`
  const eventLogNodeResult: StatRegLatestFetchInfoNodeType = getNode<StatRegLatestFetchInfoNode>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, eventLogKey)
  const eventLogNode: StatRegLatestFetchInfoNode = eventLogNodeResult && (Array.isArray(eventLogNodeResult) ? eventLogNodeResult[0] : eventLogNodeResult)

  const statRegData: StatRegStatus = {
    key,
    displayName: toDisplayString(key),
    completionTime: undefined,
    message: '',
    startTime: undefined,
    status: undefined
  }

  if (eventLogNode && eventLogNode.data.latestEventInfo) {
    statRegData.completionTime = eventLogNode.data.latestEventInfo.completionTime
    statRegData.message = eventLogNode.data.latestEventInfo.message || ''
    statRegData.startTime = eventLogNode.data.latestEventInfo.startTime
    statRegData.status = eventLogNode.data.latestEventInfo.status
  }

  return statRegData
}

export function setupHandlers(socket: Socket, socketEmitter: SocketEmitter): void {
  socket.on('statreg-dashboard-status', () => {
    socket.emit('statreg-dashboard-status-result', getStatRegFetchStatuses())
  })

  socket.on('statreg-dashboard-refresh', (statRegKeys: Array<string>) => {
    // tell all clients that the refresh starts
    statRegKeys.forEach((key) => {
      socketEmitter.broadcast('statreg-dashboard-refresh-start', key)
    })
    // start refreshing
    statRegKeys.forEach((key) => {
      setupStatRegRepo(STATREG_NODES.filter((nodeConfig) => nodeConfig.key === key))
      socketEmitter.broadcast('statreg-dashboard-refresh-result', getStatRegStatus(key))
    })
  })
}

export interface StatRegStatus {
  key: string;
  displayName: string;
  completionTime: string | undefined;
  message: string;
  startTime: string | undefined;
  status: string | undefined;
}

export interface SSBStatRegLib {
  fetchStatistics: (filters: QueryFilters) => Array<StatisticInListing>;
  transformContact: (kontakt: Kontakt) => Contact;
  fetchContacts: (filters: QueryFilters) => Array<Contact>;
  transformPublication: (pub: Publisering) => Publication;
  extractPublications: (payload: string) => Array<Publication>;
  fetchPublications: (filters: QueryFilters) => Array<Publication>;
  refreshStatRegData: () => Array<StatRegStatus>;
  getStatRegFetchStatuses: () => Array<StatRegStatus>;
  getStatRegStatus: (key: string) => StatRegStatus;
  setupHandlers: (socket: Socket, socketEmitter: SocketEmitter) => void;
}
