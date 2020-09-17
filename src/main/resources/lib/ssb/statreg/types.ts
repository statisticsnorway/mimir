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

export type KontaktNavnType = KontaktNavn | '' | undefined;

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
