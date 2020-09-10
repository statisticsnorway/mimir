import { QueryFilters } from '../../repo/common'
import { STATISTICS_URL, CONTACTS_URL, PUBLICATIONS_URL } from './config'
import { StatisticInListing, Contact, KontaktXML, Kontakt, KontaktNavnType, KontaktNavn, Publisering, Publication, PubliseringXML } from './types'
import { fetchStatRegData } from './common'
import { setupStatRegRepo, getStatRegFetchStatuses } from '../../repo/statreg'
import { XmlParser } from '../../types/xmlParser'
import { find } from 'ramda'
const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')

function extractStatistics(payload: string): Array<StatisticInListing> {
  return JSON.parse(payload).statistics
}

export function fetchStatistics(filters: QueryFilters): Array<StatisticInListing> {
  return fetchStatRegData('Statistics', STATISTICS_URL, filters, extractStatistics)
}

function extractContacts(payload: string): Array<Contact> {
  const kontaktXML: KontaktXML = __.toNativeObject(xmlParser.parse(payload))
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
  const pubXML: PubliseringXML = __.toNativeObject(xmlParser.parse(payload))
  const publisering: Array<Publisering> = pubXML.publiseringer.publisering
  return publisering.map((pub) => transformPubllication(pub))
}

// TODO: this function has to be extended to fetch all publications (the URL used only pulls the 'upcoming' items!
export function fetchPublications(filters: QueryFilters): Array<Publication> {
  return fetchStatRegData('Publications', PUBLICATIONS_URL, filters, extractPublications)
}

export function refreshStatRegData(): object {
  setupStatRegRepo()
  return getStatRegFetchStatuses()
}

