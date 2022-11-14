import { StatRegNode } from '../repo/statreg'
import { Publication, Publisering, PubliseringXML } from '../dashboard/statreg/types'
import { XmlParser } from '../../types/xmlParser'
import { HttpResponse } from '/lib/http-client'

const { ensureArray } = __non_webpack_require__('/lib/ssb/utils/arrayUtils')
const { getNode } = __non_webpack_require__('/lib/ssb/repo/common')
const { STATREG_BRANCH, STATREG_REPO, getStatRegBaseUrl, PUBLICATIONS_URL } = __non_webpack_require__(
  '/lib/ssb/dashboard/statreg/config'
)
const { fetchStatRegData } = __non_webpack_require__('/lib/ssb/dashboard/statreg/common')
const { Events, logUserDataQuery } = __non_webpack_require__('/lib/ssb/repo/query')
const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')

export const STATREG_REPO_PUBLICATIONS_KEY = 'publications'

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
    const message = `Failed to fetch data from statreg: Publications (${error})`
    logUserDataQuery('Publications', {
      file: '/lib/ssb/statreg/publications.ts',
      function: 'fetchPublications',
      message: Events.REQUEST_COULD_NOT_CONNECT,
      info: message,
      status: error,
    })
  }
  return null
}

function transformPublication(pub: Publisering): Publication {
  const { id, variant, statistikkKortnavn, deskFlyt, endret } = pub

  return {
    id,
    variant,
    statisticsKey: statistikkKortnavn,
    status: deskFlyt,
    modifiedTime: endret,
  }
}

function getAllPublicationsFromRepo(): Array<Publication> {
  const node: StatRegNode[] = getNode(
    STATREG_REPO,
    STATREG_BRANCH,
    `/${STATREG_REPO_PUBLICATIONS_KEY}`
  ) as StatRegNode[]
  const publicationsNode: StatRegNode | null = Array.isArray(node) ? node[0] : node
  return publicationsNode ? (publicationsNode.data as Array<Publication>) : []
}

export function getPublicationsForStatistic(shortName: string): Array<Publication> {
  return ensureArray(getAllPublicationsFromRepo()).filter((pub: Publication) => pub.statisticsKey === shortName)
}

export interface StatRegPublicationsLib {
  STATREG_REPO_PUBLICATIONS_KEY: string
  fetchPublications: () => Array<Publication> | null
  getPublicationsForStatistic: (shortName: string) => Array<Publication>
}
