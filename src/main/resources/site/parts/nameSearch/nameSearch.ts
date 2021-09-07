import { Response, Request } from 'enonic-types/controller'
import { Component } from 'enonic-types/portal'
import { renderError } from '../../../lib/ssb/error/error'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { NameSearchPartConfig } from './nameSearch-part-config'
import { Dataset, JSONstat as jsonStatObject } from '../../../lib/types/jsonstat-toolkit'
import { Content } from 'enonic-types/content'
import { DatasetRepoNode } from '../../../lib/ssb/repo/dataset'
import { DataSource } from '../../mixins/dataSource/dataSource'
/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { datasetOrUndefined } from '../../../lib/ssb/cache/cache'
import { TbmlDataUniform } from '../../../lib/types/xmlParser'
import { HighchartsUtilsLib } from '../../../lib/ssb/parts/highcharts/highchartsUtils'
import { HighchartsGraphConfig } from '../../../lib/types/highcharts'
import { prepareHighchartsData } from '../../../lib/ssb/parts/highcharts/highchartsData'

// import JSONstat from 'jsonstat-toolkit/import.mjs'


// const {
//   JSONstat
// } = __non_webpack_require__('jsonstat-toolkit')

const {
  getComponent,
  getContent,
  pageUrl,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getLanguageShortName
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  get
} = __non_webpack_require__('/lib/xp/content')


exports.get = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const component: Component<NameSearchPartConfig> = getComponent()
  const locale: string = getLanguageShortName(getContent())
  const isNotInEditMode: boolean = req.mode !== 'edit'


  const jsonData: Content<DataSource> | null = get({
    // key: 'fc606ea3-17a6-4408-b277-14ac8bb78b3c'
    key: '11af3826-30e6-4022-963f-93dde27b22d2'
  })

  let bankSaved: DatasetRepoNode<object | JSONstat | TbmlDataUniform> | undefined = undefined

  if (!!jsonData) {
    bankSaved = datasetOrUndefined(jsonData)
  }

  // const set: string | jsonstatType | undefined = bankSaved?.data
  // const label: string = set.Data(0).label
  // const label: string | undefined = JSONstat(bankSaved?.data).Dataset(0)
  // let label: Dataset
  let dataset: Keyable


  try {
    const labels: Keyable = bankSaved?.data.dimension.Fornavn.category.label
    const nameCode: string | undefined = getKeyByValue(labels, 'Anna')
    dataset = JSONstat(bankSaved?.data).Dataset(0).Dice({
      'Fornavn': [nameCode]
    })
  } catch (error) {
    dataset = error
  }

  // prepareHighchartsData(req, )

  log.info( 'GLNRBN dataset: ' + dataset.value )

  const urlToService: string = serviceUrl({
    service: 'nameSearch'
  })

  const props: PartProperties = {
    urlToService: urlToService,
    aboutLink: aboutLinkResources(component.config),
    nameSearchDescription: component.config.nameSearchDescription,
    phrases: partsPhrases(locale),
    graphData: dataset.value
  }

  return React4xp.render('site/parts/nameSearch/nameSearch', props, req, {
    clientRender: isNotInEditMode
  })
}

function getKeyByValue(object: Keyable, value: string): string | undefined {
  return Object.keys(object).find((key) => object[key] === value)
}

function aboutLinkResources(config: Component<NameSearchPartConfig>['config']): PartProperties['aboutLink'] | undefined {
  if (config.aboutLinkTitle && config.aboutLinkTarget) {
    return {
      title: config.aboutLinkTitle,
      url: pageUrl({
        id: config.aboutLinkTarget
      })
    }
  }
  return undefined
}

function partsPhrases(locale: string): PartProperties['phrases'] {
  return {
    nameSearchTitle: localize({
      key: 'nameSearch.title',
      locale
    }),
    nameSearchInputLabel: localize({
      key: 'nameSearch.inputLabel',
      locale
    }),
    nameSearchButtonText: localize({
      key: 'nameSearch.buttonText',
      locale
    }),
    interestingFacts: localize({
      key: 'nameSearch.interestingFacts',
      locale
    }),
    nameSearchResultTitle: localize({
      key: 'nameSearch.resultTitle',
      locale
    }),
    thereAre: localize({
      key: 'nameSearch.thereAre',
      locale
    }),
    with: localize({
      key: 'nameSearch.with',
      locale
    }),
    asTheir: localize({
      key: 'nameSearch.asTheir',
      locale
    }),
    errorMessage: localize({
      key: 'nameSearch.errorMessage',
      locale
    }),
    networkErrorMessage: localize({
      key: 'nameSearch.networkError',
      locale
    }),
    threeOrLessText: localize({
      key: 'nameSearch.threeOrLessText',
      locale
    }),
    women: localize({
      key: 'women',
      locale
    }),
    men: localize({
      key: 'men',
      locale
    }),
    types: {
      firstgivenandfamily: localize({
        key: 'nameSearch.types.firstgivenandfamily',
        locale
      }),
      middleandfamily: localize({
        key: 'nameSearch.types.middleandfamily',
        locale
      }),
      family: localize({
        key: 'nameSearch.types.family',
        locale
      }),
      onlygiven: localize({
        key: 'nameSearch.types.onlygiven',
        locale
      }),
      onlygivenandfamily: localize({
        key: 'nameSearch.types.onlygivenandfamily',
        locale
      }),
      firstgiven: localize({
        key: 'nameSearch.types.firstgiven',
        locale
      })
    }
  }
}

interface PartProperties {
  urlToService: string;
  aboutLink?: {
    title: string;
    url: string;
  };
  nameSearchDescription?: string;
  phrases: {
    nameSearchTitle: string;
    nameSearchInputLabel: string;
    nameSearchButtonText: string;
    interestingFacts: string;
    nameSearchResultTitle: string;
    thereAre: string;
    with: string;
    asTheir: string;
    errorMessage: string;
    networkErrorMessage: string;
    threeOrLessText: string;
    women: string;
    men: string;
    types: {
      firstgivenandfamily: string;
      middleandfamily: string;
      family: string;
      onlygiven: string;
      onlygivenandfamily: string;
      firstgiven: string;
    };
  };
  graphData?: string;
}

interface NameData {
  fornavn: Dataset | null;
  tid: Dataset | null;
}


interface Keyable {
  [key: string]: string;
}
