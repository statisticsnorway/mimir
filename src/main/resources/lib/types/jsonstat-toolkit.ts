/*
 * https://github.com/badosa/JSON-stat
 */
export interface JsonstatToolkit {
    JSONstat: (res: object ) => JSONstat;
}

export interface JSONstat {
    readonly length: number;
    readonly id: Array<string>;
    readonly classes: Array<string>;
    Dataset: (dsid: number | string) => Array<Dataset> | Dataset | null;
}

export interface Dataset {
    readonly id: Array<string>;
    readonly class: 'collection' | 'bundle' | 'dataset' | 'dimension';
    Dimension: (dimid: string | number | undefined ) => Array<Dimension> | Dimension | null;
    Data: (dataid: Array<number|string>, status: boolean) => Data | null;
}

export interface Data {
    value: Array<string | number>;
    status: Array<string | number> | null;
}

export interface Dimension {
    id?: string | undefined;
    code: string;
    selection: SelectionFilter;
    Category: (catid?: string | number ) => Array<Category> | Category | null;
}

export interface Category {
    id: Array<string>;
    label: string;
    length: number;
    coordinates: Array<number>;
    unit: Role | null;
    note: Array<string>;
    index: number;
}

export interface Role {
    time: string;
    geo: Array<number>;
    metric: string;
    classification: string;
}

export interface SelectionFilter {
    filter: string;
    values: Array<string>;
}
