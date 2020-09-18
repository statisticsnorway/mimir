import { StatRegNode } from '../statreg'
import { Publication, Publisering, PubliseringXML } from '../../ssb/statreg/types'
import { ArrayUtilsLib } from '../../ssb/arrayUtils'
import { QueryFilters, RepoCommonLib } from '../common'
import { StatRegConfigLib } from '../../ssb/statreg/config'
import { XmlParser } from '../../types/xmlParser'
import { StatRegCommonLib } from '../../ssb/statreg/common'

const {
  ensureArray
}: ArrayUtilsLib = __non_webpack_require__('/lib/ssb/arrayUtils')
const {
  getNode
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')
const {
  STATREG_BRANCH,
  STATREG_REPO,
  getStatRegBaseUrl,
  PUBLICATIONS_URL
}: StatRegConfigLib = __non_webpack_require__('/lib/ssb/statreg/config')
const {
  fetchStatRegData
}: StatRegCommonLib = __non_webpack_require__('/lib/ssb/statreg/common')
const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')

export const STATREG_REPO_PUBLICATIONS_KEY: string = 'publications'

function extractPublications(payload: string): Array<Publication> {
  const pubXML: PubliseringXML = JSON.parse(xmlParser.parse(payload))
  const publisering: Array<Publisering> = pubXML.publiseringer.publisering
  return publisering.map((pub) => transformPublication(pub))
}

// TODO: this function has to be extended to fetch all publications (the URL used only pulls the 'upcoming' items!
export function fetchPublications(filters: QueryFilters): Array<Publication> {
  return fetchStatRegData('Publications', getStatRegBaseUrl() + PUBLICATIONS_URL, filters, extractPublications)
}

function transformPublication(pub: Publisering): Publication {
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

function getAllPublicationsFromRepo(): Array<Publication> | null {
  const node: StatRegNode[] = getNode(STATREG_REPO, STATREG_BRANCH, `/${STATREG_REPO_PUBLICATIONS_KEY}`) as StatRegNode[]
  const publicationsNode: StatRegNode | null = Array.isArray(node) ? node[0] : node
  return publicationsNode ? (publicationsNode.content as Array<Publication>) : null
}

export function getPublicationsForStatistic(shortName: string): Array<Publication> {
  return ensureArray(getAllPublicationsFromRepo())
    .filter((pub: Publication) => pub.statisticsKey === shortName)
}

export interface StatRegPublicationsLib {
  STATREG_REPO_PUBLICATIONS_KEY: string;
  fetchPublications: () => Array<Publication>;
  getPublicationsForStatistic: (shortName: string) => Array<Publication>;
}
