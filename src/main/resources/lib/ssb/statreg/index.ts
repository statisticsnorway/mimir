import { QueryFilters } from '../../repo/common'
import { STATISTICS_URL, CONTACTS_URL, PUBLICATIONS_URL } from './config'
import { extractStatistics, extractContacts, extractPublications } from './types'
import { fetchStatRegData } from './common'


export function fetchStatistics(filters: QueryFilters) {
  return fetchStatRegData('Statistics', STATISTICS_URL, filters, extractStatistics)
}

export function fetchContacts(filters: QueryFilters) {
  return fetchStatRegData('Contacts', CONTACTS_URL, filters, extractContacts)
}

// TODO: this function has to be extended to fetch all publications (the URL used only pulls the 'upcoming' items!
export function fetchPublications(filters: QueryFilters) {
  return fetchStatRegData('Publications', PUBLICATIONS_URL, filters, extractPublications)
}
