import { StatRegNode } from '../repo/statreg'
import { Publication, Publisering, PubliseringXML } from '../dashboard/statreg/types'
import { ArrayUtilsLib } from '../utils/arrayUtils'
import { RepoCommonLib } from '../repo/common'
import { StatRegConfigLib } from '../dashboard/statreg/config'
import { XmlParser } from '../../types/xmlParser'
import { StatRegCommonLib } from '../dashboard/statreg/common'
import { RepoQueryLib } from '../repo/query'
import { HttpResponse } from 'enonic-types/http'

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
const {
  Events,
  logUserDataQuery
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')
const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')

export const STATREG_REPO_PUBLICATIONS_KEY: string = 'publications'

function extractPublications(payload: string): Array<Publication> {
  const pubXML: PubliseringXML = JSON.parse(xmlParser.parse(payload))
  const publisering: Array<Publisering> = pubXML.publiseringer.publisering
  return publisering.map((pub) => transformPublication(pub))
}

export function fetchPublications(): Array<Publication> | null {
  try {
    const response: HttpResponse = fetchStatRegData('Publications', getStatRegBaseUrl() + PUBLICATIONS_URL)
    if (response.status === 200 && response.body) {
      return extractPublications(response.body)
    }
  } catch (error) {
    const message: string = `Failed to fetch data from statreg: Publications (${error})`
    logUserDataQuery('Publications', {
      file: '/lib/ssb/statreg/publications.ts',
      function: 'fetchPublications',
      message: Events.REQUEST_COULD_NOT_CONNECT,
      info: message,
      status: error
    })
  }
  return null
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

function getAllPublicationsFromRepo(): Array<Publication> {
  const node: StatRegNode[] = getNode(STATREG_REPO, STATREG_BRANCH, `/${STATREG_REPO_PUBLICATIONS_KEY}`) as StatRegNode[]
  const publicationsNode: StatRegNode | null = Array.isArray(node) ? node[0] : node
  return publicationsNode ? (publicationsNode.data as Array<Publication>) : []
}

export function getPublicationsForStatistic(shortName: string): Array<Publication> {
  return ensureArray(getAllPublicationsFromRepo())
    .filter((pub: Publication) => pub.statisticsKey === shortName)
}

export interface StatRegPublicationsLib {
  STATREG_REPO_PUBLICATIONS_KEY: string;
  fetchPublications: () => Array<Publication> | null;
  getPublicationsForStatistic: (shortName: string) => Array<Publication>;
}
