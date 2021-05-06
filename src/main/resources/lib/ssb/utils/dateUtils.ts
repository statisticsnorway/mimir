import { VariantInListing } from '../dashboard/statreg/types'

export function checkVariantReleaseDate(variant: VariantInListing, day: Date): boolean {
  return sameDay(new Date(variant.previousRelease), day)
}

export function sameDay(d1: Date, d2: Date): boolean {
  return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear()
}

export interface DateUtilsLib {
    checkVariantReleaseDate: (variant: VariantInListing, day: Date) => boolean;
    sameDay: (d1: Date, d2: Date) => boolean;
}
