import { QueryFilters, getNode } from '../../repo/common'
import { STATISTICS_URL, CONTACTS_URL, PUBLICATIONS_URL } from './config'
import { StatisticInListing, Contact, KontaktXML, Kontakt, KontaktNavnType, KontaktNavn, Publisering, Publication, PubliseringXML } from './types'
import { fetchStatRegData } from './common'
import { setupStatRegRepo, toDisplayString, STATREG_NODES } from '../../repo/statreg'
import { XmlParser } from '../../types/xmlParser'
import { find } from 'ramda'
import { Socket, SocketEmitter } from '../../types/socket'
import { STATREG_REPO_CONTACTS_KEY } from '../../repo/statreg/contacts'
import { STATREG_REPO_STATISTICS_KEY } from '../../repo/statreg/statistics'
import { STATREG_REPO_PUBLICATIONS_KEY } from '../../repo/statreg/publications'
import { StatRegLatestFetchInfoNode } from '../../repo/statreg/eventLog'
import { EVENT_LOG_REPO, EVENT_LOG_BRANCH } from '../../repo/eventLog'
const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')

function extractStatistics(payload: string): Array<StatisticInListing> {
  return JSON.parse(payload).statistics
}

export function fetchStatistics(filters: QueryFilters): Array<StatisticInListing> {
  return fetchStatRegData('Statistics', STATISTICS_URL, filters, extractStatistics)
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
  return fetchStatRegData('Contacts', CONTACTS_URL, filters, extractContacts)
}

export function transformPubllication(pub: Publisering): Publication {
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
  return publisering.map((pub) => transformPubllication(pub))
}

// TODO: this function has to be extended to fetch all publications (the URL used only pulls the 'upcoming' items!
export function fetchPublications(filters: QueryFilters): Array<Publication> {
  return fetchStatRegData('Publications', PUBLICATIONS_URL, filters, extractPublications)
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
