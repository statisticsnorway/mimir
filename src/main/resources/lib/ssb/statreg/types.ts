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
    status: string;
    modifiedTime: string;
}

export function transformStat(stat: Statistikk): Statistic {
  const {
    id, kortnavn: shortName, status, endret: modifiedTime
  } = stat

  return {
    id,
    shortName,
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
    statistikkKortNavn: string;
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
    id, variant, statistikkKortNavn, deskFlyt, endret
  } = pub

  return {
    id,
    variant,
    statisticsKey: statistikkKortNavn,
    status: deskFlyt,
    modifiedTime: endret
  }
}

export function extractPublications(pubXML: PubliseringXML): Array<Publication> {
  const publisering: Array<Publisering> = pubXML.publiseringer.publisering
  return publisering.map((pub) => transformPubllication(pub))
}
