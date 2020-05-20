import { find } from 'ramda'

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

export interface KontaktListe {
    antall: number;
    dato: string;
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

export function transform(kontakt: Kontakt): Contact {
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
  return kontakter.map((k) => transform(k))
}
