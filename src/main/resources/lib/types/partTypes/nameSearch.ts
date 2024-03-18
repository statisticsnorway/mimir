export interface NameSearchProps {
  urlToService: string
  aboutLink?: {
    title: string
    url: string
  }
  nameSearchDescription?: string
  frontPage: boolean
  phrases: {
    nameSearchTitle: string
    nameSearchInputLabel: string
    nameSearchButtonText: string
    interestingFacts: string
    nameSearchResultTitle: string
    thereAre: string
    with: string
    have: string
    asTheir: string
    errorMessage: string
    networkErrorMessage: string
    threeOrLessText: string
    yAxis: string
    graphHeader: string
    loadingGraph: string
    threeOrLessTextGraph: string
    historicalTrend: string
    chart: string
    women: string
    men: string
    types: {
      firstgivenandfamily: string
      middleandfamily: string
      family: string
      onlygiven: string
      onlygivenandfamily: string
      firstgiven: string
    }
    printChart: string
    downloadPNG: string
    downloadJPEG: string
    downloadPDF: string
    downloadSVG: string
    downloadCSV: string
    downloadXLS: string
    chartContainerLabel: string
    chartMenuLabel: string
    menuButtonLabel: string
    beforeRegionLabel: string
    legendItem: string
    legendLabel: string
    legendLabelNoTitle: string
    close: string
  }
  language: string
  GA_TRACKING_ID: string | null
}
