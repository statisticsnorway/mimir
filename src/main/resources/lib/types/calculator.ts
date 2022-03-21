export interface CalculatorPeriod {
    month: number | string;
    year: number | string;
}

export interface CalculatorDropdownItem {
    id: string;
    title: string;
}

export type CalculatorDropdownItems = Array<CalculatorDropdownItem>
