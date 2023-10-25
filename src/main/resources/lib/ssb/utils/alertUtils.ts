import { processHtml } from '/lib/xp/portal'
import { MunicipalityWithCounty } from '/lib/ssb/dataset/klass/municipalities'

import { list as listOperationsAlerts } from '/lib/ssb/parts/operationsAlert'
import { list as listMunicipalityAlerts } from '/lib/ssb/parts/municipalityAlert'
import { list as listInformationAlerts } from '/lib/ssb/parts/informationAlert'
import { type Default as DefaultPageConfig } from '/site/pages/default'

function getInformationAlerts(options: InformationAlertOptions): Array<InformationAlert> {
  const alerts: Array<Alerts> = [
    ...listOperationsAlerts().hits,
    ...listInformationAlerts(options.pageType, options.pageTypeId, options.statbankWeb).hits,
  ]
  return alerts.map((alert) => ({
    title: alert.displayName,
    messageType: alert.type === `${app.name}:operationsAlert` ? 'warning' : 'info',
    message: processHtml({
      value: alert.data.message,
    }),
  }))
}

function getMunicipalityAlerts(options: MunicipalityOptions): Array<MunicipalityAlert> {
  const municipality: MunicipalityWithCounty | undefined = options.municipality
  const municipalPageType: string = options.municipalPageType
  const currentMunicipalityAlerts: CurrentMunicipalityAlerts = options.municipality
    ? listMunicipalityAlerts(municipality && municipality.code, municipalPageType)
    : {
        hits: [],
      }
  const alerts: Array<Alerts> = [...listOperationsAlerts().hits, ...currentMunicipalityAlerts.hits]
  return alerts.map((alert) => ({
    title: alert.displayName,
    messageType: alert.type === `${app.name}:operationsAlert` ? 'warning' : 'info',
    municipalCodes: alert.data.municipalCodes,
    message: processHtml({
      value: alert.data.message,
    }),
  }))
}

export function alertsForContext(
  config: DefaultPageConfig,
  options: InformationAlertOptions | MunicipalityOptions
): AlertType {
  if (config && config.pageType === 'municipality') {
    return getMunicipalityAlerts(options as MunicipalityOptions)
  }
  return getInformationAlerts(options as InformationAlertOptions)
}

interface Alerts {
  displayName: string
  type: string
  data: {
    message: string
    municipalCodes: string
  }
}
interface InformationAlert {
  title: string
  messageType: string
  message: string
}

interface CurrentMunicipalityAlerts {
  hits: Array<MunicipalityAlert>
}

interface MunicipalityAlert {
  title: string
  messageType: string
  municipalCodes: string
  message: string
}
export interface InformationAlertOptions {
  pageType: string
  pageTypeId: string
  statbankWeb: boolean
}
export interface MunicipalityOptions {
  municipality: MunicipalityWithCounty | undefined
  municipalPageType: string
}

export type AlertType = Array<InformationAlert> | Array<MunicipalityAlert>
