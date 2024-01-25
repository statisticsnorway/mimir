import React, { useState, useEffect, useRef } from 'react'
import { Accordion, Button, Divider, Input, Link, Title } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { Col, Container, Row, Form } from 'react-bootstrap'
import axios from 'axios'
import { X } from 'react-feather'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import highchartsExporting from 'highcharts/modules/exporting'
import highchartsExportData from 'highcharts/modules/export-data'
import highchartsAccessibility from 'highcharts/modules/accessibility'
import { useMediaQuery } from 'react-responsive'
import { addGtagForEvent } from '/react4xp/ReactGA'

import accessibilityLang from './../../../assets/js/highchart-lang.json'

if (typeof window !== 'undefined' && typeof Highcharts === 'object') {
  highchartsExporting(Highcharts)
  highchartsExportData(Highcharts)
  highchartsAccessibility(Highcharts)
}

/* TODO
- Etternavn må få rett visning av beste-treff
- Skjule mindre interessante resultater - må sikkert diskuteres noen runder med Siv og Ina
*/

function NameSearch(props) {
  const [name, setName] = useState({
    error: false,
    errorMessage: props.phrases.errorMessage,
    value: '',
  })
  const [result, setResult] = useState(null)
  const [mainResult, setMainResult] = useState(undefined)
  const [searchedTerm, setSearchedTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(undefined)
  const [nameGraphData, setNameGraphData] = useState([])
  const submitButton = useRef(null)
  const scrollAnchor = useRef(null)

  useEffect(() => {
    if (!loading && scrollAnchor.current !== null) {
      scrollAnchor.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      })
      scrollAnchor.current.focus()
    }
  }, [loading])

  function closeResult() {
    setResult(null)
    submitButton.current.focus()
  }

  function findMainResult(docs, originalName) {
    // only get result with same name as the input
    const filteredResult = docs.filter((doc) => doc.name === originalName.toUpperCase())
    const mainRes =
      filteredResult.length &&
      filteredResult.reduce((acc, current) => {
        if (!acc || acc.count < current.count) {
          acc = current // get the hit with the highest count
        }
        return acc
      })
    setMainResult(mainRes)
  }

  function renderMainResult() {
    return (
      <Row>
        <Col>
          <p className='result-highlight my-4'>
            {!mainResult || mainResult.count <= 3 ? parseThreeOrLessText(mainResult) : parseResultText(mainResult)}
          </p>
        </Col>
      </Row>
    )
  }

  function renderSubResult(docs) {
    const subResult = docs.filter((doc) => doc.type !== mainResult.type)
    if (subResult.length > 0) {
      return (
        <Row>
          <Col>
            <strong>{props.phrases.interestingFacts}</strong>
            <ul className='interesting-facts p-0'>
              {subResult.map((doc, i) => {
                return (
                  <li key={i} className='my-1'>
                    {parseResultText(doc)}
                  </li>
                )
              })}
            </ul>
          </Col>
        </Row>
      )
    }
  }

  function renderResult() {
    const desktop = useMediaQuery({
      minWidth: 992,
    })

    if (loading) {
      return (
        <Container className='name-search-result text-center'>
          <span className='spinner-border spinner-border' />
        </Container>
      )
    }
    if (errorMessage) {
      return (
        <Container className='name-search-result'>
          <div>
            {props.phrases.networkErrorMessage} {errorMessage}
          </div>
        </Container>
      )
    } else {
      return (
        result && (
          <div>
            <Container
              className={`name-search-result ${props.frontPage ? 'front-page-results' : ''}`}
              ref={scrollAnchor}
              tabIndex='0'
            >
              <Row>
                <Col>
                  <Title size={3} className='result-title mb-1'>
                    {props.phrases.nameSearchResultTitle}
                  </Title>
                  <Divider dark />
                </Col>
              </Row>
              {result.response && renderMainResult()}
              {result.response && renderSubResult(result.response.docs)}
              {result.nameGraphData.length > 0 && renderGraphLink(desktop)}
              <Row>
                <Col className='md-6'>
                  <Button className='close-button' onClick={() => closeResult()} type='button'>
                    {' '}
                    <X size='18' /> {props.phrases.close}{' '}
                  </Button>
                </Col>
              </Row>
            </Container>
          </div>
        )
      )
    }
  }
  function parseResultText(doc) {
    return (
      <span>
        <span className='details'>{doc.count}</span>
        {` ${formatGender(doc.gender)} ${props.phrases.have} `}
        <span className='details name-search-name'>{doc.name.toLowerCase()} </span>
        {` ${props.phrases.asTheir} ${translateName(doc.type)} `}
      </span>
    )
  }

  function formatGender(gender) {
    switch (gender) {
      case 'F':
        return props.phrases.women
      case 'M':
        return props.phrases.men
      default:
        return ''
    }
  }

  function parseThreeOrLessText(doc) {
    return (
      <span>
        {` ${props.phrases.threeOrLessText} `}
        <strong className='name-search-name'>{searchedTerm}</strong>
        {` ${doc.type ? ` ${props.phrases.asTheir} ${translateName(doc.type)} ` : ''}`}
      </span>
    )
  }

  function translateName(nameCode) {
    return props.phrases.types[nameCode]
  }

  function handleSubmit(form) {
    form.preventDefault()
    setResult(null) // Clear result box
    setNameGraphData(null) // Clear name graph data

    if (!name.value) {
      return // Do nothing further if no name is submitted (prevents fun errors)
    }
    setLoading(true) // Spin the spinner!
    setErrorMessage(undefined) // Clear network error message, if any
    setSearchedTerm(name.value)

    if (props.GA_TRACKING_ID) {
      addGtagForEvent(props.GA_TRACKING_ID, 'Navn det søkes på', 'Navnekalkulator', name.value)
    }

    axios
      .get(props.urlToService, {
        params: {
          name: name.value,
          includeGraphData: true,
        },
        timeout: 20000,
      })
      .then((res) => {
        findMainResult(res.data.response.docs, res.data.originalName)
        setResult(res.data)
        setNameGraphData(res.data.nameGraphData)
      })
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setErrorMessage(error.message)
        } else if (error.request) {
          // The request was made but no response was received
          // Likely to be a network error or disconnect
          console.log('Error in REQUEST')
          console.log(error.request)
          setErrorMessage(error.message)
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log(error)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function handleChange(event) {
    setName({
      errorMessage: name.errorMessage,
      value: event,
      error: !isNameValid(event),
    })
  }

  function isNameValid(nameToCheck) {
    // Regexp: Note use of 'i' flag, making the match case insensitive. Also, remember regexp ranges are based on unicode character codes.
    const invalidCharacters = !!nameToCheck && nameToCheck.match(/[^a-zÐÞ∂þèéëôòóáäüöæøå\-\s]/gim)
    return !invalidCharacters
  }

  function renderGraphLink(desktop) {
    return (
      <Accordion className='name-search-link' header={props.phrases.historicalTrend} subHeader={props.phrases.chart}>
        {renderGraphs(desktop, searchedTerm)}
      </Accordion>
    )
  }

  function renderGraphs(desktop, nameForRender) {
    const { frontPage, phrases, language } = props
    const lineColor = '#21383a'

    // Highchart language checker
    if (language !== 'en') {
      Highcharts.setOptions({
        lang: {
          ...accessibilityLang.lang,
          accessibility: {
            ...accessibilityLang.lang.accessibility,
            chartContainerLabel: props.phrases.chartContainerLabel,
            exporting: {
              ...accessibilityLang.lang.accessibility.exporting,
              chartMenuLabel: props.phrases.chartMenuLabel,
              menuButtonLabel: props.phrases.menuButtonLabel,
            },
            screenReaderSection: {
              ...accessibilityLang.lang.accessibility.screenReaderSection,
              beforeRegionLabel: props.phrases.beforeRegionLabel,
              endOfChartMarker: '',
            },
            legend: {
              ...accessibilityLang.lang.accessibility.legend,
              legendItem: props.phrases.legendItem,
              legendLabel: props.phrases.legendLabel,
              legendLabelNoTitle: props.phrases.legendLabelNoTitle,
            },
          },
          decimalPoint: accessibilityLang.lang.decimalPoint,
        },
      })
    }

    if (nameGraphData) {
      const options = {
        chart: {
          type: 'spline',
          height: frontPage || !desktop ? '380px' : '75%',
          spacingTop: !desktop ? (language === 'en' ? 10 : 0) : 10,
        },
        colors: [
          '#1a9d49',
          '#274247',
          '#3396d2',
          '#f0e442',
          '#f26539',
          '#aee5c3',
          '#ed51c9',
          '#0094a3',
          '#e9b200',
          '#143f90',
          '#075745',
          '#4b7272',
          '#6d58a4',
          '#83c1e9',
          '#b59924',
        ],
        title: {
          style: {
            color: 'transparent',
          },
          align: 'left',
          text: phrases.graphHeader + ' ' + nameForRender,
          x: 20,
        },
        subtitle: {
          align: 'center',
          verticalAlign: 'bottom',
          widthAdjust: 0,
          text: phrases.threeOrLessTextGraph,
        },
        xAxis: {
          lineColor,
          tickColor: lineColor,
        },
        yAxis: {
          title: {
            text: phrases.yAxis,
            align: 'high',
            offset: 0,
            rotation: 0,
            y: -30,
            x: 10,
            style: {
              width: 80,
            },
          },
          lineColor,
          lineWidth: 1,
          tickColor: lineColor,
          tickWidth: 1,
        },
        plotOptions: {
          series: {
            marker: {
              enabled: false,
            },
            pointStart: 1880, // Magic number: Name data starts in the year 1880 and we try to get all the years since.
          },
        },
        series: nameGraphData,
        credits: {
          enabled: false,
        },
        exporting: {
          buttons: {
            contextButton: {
              menuItems: [
                'printChart',
                'separator',
                'downloadPNG',
                'downloadJPEG',
                'downloadPDF',
                'downloadSVG',
                'separator',
                'downloadCSV',
                'downloadXLS',
              ],
              y: !desktop ? (language === 'en' ? 0 : 15) : 0,
            },
          },
          enabled: true,
          menuItemDefinitions: {
            printChart: {
              text: props.phrases.printChart,
            },
            downloadPNG: {
              text: props.phrases.downloadPNG,
            },
            downloadJPEG: {
              text: props.phrases.downloadJPEG,
            },
            downloadPDF: {
              text: props.phrases.downloadPDF,
            },
            downloadSVG: {
              text: props.phrases.downloadSVG,
            },
            downloadCSV: {
              text: props.phrases.downloadCSV,
            },
            downloadXLS: {
              text: props.phrases.downloadXLS,
            },
          },
        },
        csv: {
          itemDelimiter: ';',
        },
      }

      return (
        <Row className='name-search-graph py-3 px-0 mx-0'>
          <Col className='p-0'>
            <div>
              <HighchartsReact highcharts={Highcharts} options={options} />
            </div>
          </Col>
        </Row>
      )
    } else return <div></div>
  }

  return (
    <section className='name-search container-fluid p-0' id='navnesok'>
      <Container className='name-search-input'>
        <Row>
          <Col lg='12'>
            <Title size={2}>{props.phrases.nameSearchTitle}</Title>
          </Col>
          {props.nameSearchDescription && (
            <Col lg='12'>
              <div
                dangerouslySetInnerHTML={{
                  __html: props.nameSearchDescription.replace(/&nbsp;/g, ' '),
                }}
              ></div>
            </Col>
          )}
        </Row>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col>
              <Input
                className='mt-2 mb-4'
                name='navn'
                label={props.phrases.nameSearchInputLabel}
                value={name.value}
                handleChange={handleChange}
                error={name.error}
                errorMessage={name.errorMessage}
                role='search'
                ariaLabelWrapper={props.phrases.nameSearchTitle}
              />
            </Col>
          </Row>
          <Row>
            <Col lg md='12'>
              <Button primary type='submit' ref={submitButton}>
                {props.phrases.nameSearchButtonText}
              </Button>
            </Col>
            <Col lg md='12' className='name-search-about-link'>
              {props.aboutLink && props.aboutLink.url && (
                <Link href={props.aboutLink.url}>{props.aboutLink.title}</Link>
              )}
            </Col>
          </Row>
        </Form>
      </Container>
      {renderResult()}
    </section>
  )
}

NameSearch.propTypes = {
  urlToService: PropTypes.string,
  urlToGraphService: PropTypes.string,
  aboutLink: PropTypes.shape({
    title: PropTypes.string,
    url: PropTypes.string,
  }),
  nameSearchDescription: PropTypes.string,
  frontPage: PropTypes.bool,
  phrases: PropTypes.shape({
    nameSearchTitle: PropTypes.string,
    nameSearchInputLabel: PropTypes.string,
    nameSearchButtonText: PropTypes.string,
    interestingFacts: PropTypes.string,
    nameSearchResultTitle: PropTypes.string,
    thereAre: PropTypes.string,
    with: PropTypes.string,
    have: PropTypes.string,
    asTheir: PropTypes.string,
    errorMessage: PropTypes.string,
    networkErrorMessage: PropTypes.string,
    threeOrLessText: PropTypes.string,
    threeOrLessTextGraph: PropTypes.string,
    yAxis: PropTypes.string,
    graphHeader: PropTypes.string,
    historicalTrend: PropTypes.string,
    chart: PropTypes.string,
    women: PropTypes.string,
    men: PropTypes.string,
    types: PropTypes.shape({
      firstgivenandfamily: PropTypes.string,
      middleandfamily: PropTypes.string,
      family: PropTypes.string,
      onlygiven: PropTypes.string,
      onlygivenandfamily: PropTypes.string,
      firstgiven: PropTypes.string,
    }),
    printChart: PropTypes.string,
    downloadPNG: PropTypes.string,
    downloadJPEG: PropTypes.string,
    downloadPDF: PropTypes.string,
    downloadSVG: PropTypes.string,
    downloadCSV: PropTypes.string,
    downloadXLS: PropTypes.string,
    chartContainerLabel: PropTypes.string,
    chartMenuLabel: PropTypes.string,
    menuButtonLabel: PropTypes.string,
    beforeRegionLabel: PropTypes.string,
    legendItem: PropTypes.string,
    legendLabel: PropTypes.string,
    legendLabelNoTitle: PropTypes.string,
    close: PropTypes.string,
  }),
  language: PropTypes.string,
  graphData: PropTypes.bool,
  GA_TRACKING_ID: PropTypes.string,
}

export default (props) => <NameSearch {...props} />
