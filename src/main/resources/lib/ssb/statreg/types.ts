import { find } from 'ramda'

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

export function extractContacts(kontaktXML: KontaktXML): Array<Contact> {
  const kontakter: Array<Kontakt> = kontaktXML.kontakter.kontakt
  return kontakter.map((k) => transformContact(k))
}

// XML response types for Statistics from StatReg ----------------------------------

export interface Statistikk {
    id: string;
    kortnavn: string;
    navn: string;
    status: string;
    deskFlyt: string;
    dirFlyt: string;
    endret: string;
}

export interface StatistikkListe extends ListMeta {
    statistikk: Array<Statistikk>;
}

export interface StatistikkXML {
    statistikker: StatistikkListe;
}

export interface Statistic {
    id: string;
    shortName: string;
    name: string;
    status: string;
    modifiedTime: string;
}

export function transformStat(stat: Statistikk): Statistic {
  const {
    id, kortnavn: shortName, navn: name, status, endret: modifiedTime
  } = stat

  return {
    id,
    shortName,
    name,
    status,
    modifiedTime
  }
}

export function extractStatistics(statXML: StatistikkXML): Array<Statistic> {
  const statistikk: Array<Statistikk> = statXML.statistikker.statistikk
  return statistikk.map((stat) => transformStat(stat))
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

export function extractPublications(pubXML: PubliseringXML): Array<Publication> {
  const publisering: Array<Publisering> = pubXML.publiseringer.publisering
  return publisering.map((pub) => transformPubllication(pub))
}

//----- export all data -------

export interface AlleData {
    id: string;
    kortnavn: string;
    navn: string;
    status: string;
    deskFlyt: string;
    dirFlyt: string;
    endret: string;
}

export interface AlleDataListe extends ListMeta {
    allData: Array<AllData>;
}

export interface AllDataXML {
    statistikker: StatistikkListe;
    publiseringer: PubliseringsListe;
    kontakter: KontaktListe;
}

export interface AllData {
    id: string;
    shortName: string;
    name: string;
    status: string;
    modifiedTime: string;
}

export function transformAllData(all: AlleData): AllData {
    const {
        id, variant, statistikkKortnavn, deskFlyt, kortnavn, navn, status, endret
    } = all

    return {
        id,
        variant,
        statisticsKey: statistikkKortnavn,
        status: deskFlyt,
        shortName: kortnavn,
        name: navn,
        status,
        modifiedTime: endret
    }
}

export function extractAllData(kontaktXML: kontaktXML, statXML: StatistikkXML, pubXML: PubliseringXML): Array<AllData> {
    const allData: Array<AllData> = kontaktXML.kontakter.kontakt , statXML.statistikker.statistikk , pubXML.publiseringer.publisering
    return allData.map((all) => transformAllData(all))
}
