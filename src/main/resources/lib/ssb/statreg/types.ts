import { find } from 'ramda'
import { XmlParser } from '../../types/xmlParser'
const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')

// XML response types (Common)

export interface ListMeta {
    antall: number;
    dato: string;
}

// XML response types for Contacts from StatReg ----------------------------------

export interface KontaktNavn {
    'xml:lang': string;
    content: string;
}

export interface Kontakt {
    id: string;
    epost: string;
    telefon: number;
    mobil: number;
    navn: Array<KontaktNavn>;
}

export interface KontaktListe extends ListMeta {
    kontakt: Array<Kontakt>;
}

export interface KontaktXML {
    kontakter: KontaktListe;
}

export interface Contact {
    id: string;
    telephone: number;
    mobile: number;
    email: string;
    name: string;
}

// -------------------------------------------------------------------------------

type KontaktNavnType = KontaktNavn | '' | undefined;

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

export function extractContacts(payload: string): Array<Contact> {
  const kontaktXML: KontaktXML = __.toNativeObject(xmlParser.parse(payload))
  const kontakter: Array<Kontakt> = kontaktXML.kontakter.kontakt
  return kontakter.map((k) => transformContact(k))
}

// XML response types for Statistics from StatReg ----------------------------------

/**
 * NOTE:
 * The following '.*Listing' types are only the basic information that comes with the
 * GET /statistics listing endpoint. This has to be extended
 * (and named properly as Variant & Statistic) when we start using the
 * GET /statistics/{shortName} endpoint
 */
export interface VariantInListing {
    frekvens: string;
    previousRelease: string;
    nextRelease: string;
}

export interface StatisticInListing {
    id: string;
    shortName: string;
    name: string;
    status: string;
    modifiedTime: string;
    variants: Array<VariantInListing>;
}

export interface Statistics {
    statistics: Array<StatisticInListing>;
}

export function extractStatistics(payload: string): Array<StatisticInListing> {
  return JSON.parse(payload).statistics
}

// XML response types from StatReg for Publications --------------------------------

export interface Publisering {
    id: string;
    variant: string;
    deskFlyt: string;
    endret: string;
    statistikkKortnavn: string;
}

export interface PubliseringsListe extends ListMeta {
    publisering: Array<Publisering>;
}

export interface PubliseringXML {
    publiseringer: PubliseringsListe;
}

export interface Publication {
    id: string;
    variant: string;
    statisticsKey: string;
    status: string;
    modifiedTime: string;
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
