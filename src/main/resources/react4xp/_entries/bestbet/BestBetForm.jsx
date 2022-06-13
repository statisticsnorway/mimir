import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'react-bootstrap'
import { Input, TextArea, Dropdown, Button, Divider, Tabs, RadioGroup } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'
import AsyncSelect from 'react-select/async'
import 'regenerator-runtime'
import { BestBetContext } from './Bestbet'
import { customAsyncSelectStyles } from './customAsyncSelectStyles'

function BestBetForm(props) {
  const {
    formState, dispatch
  } = useContext(BestBetContext)

  function handleTabOnClick(item) {
    if (item === 'xp-content') {
      dispatch({
        type: 'handle',
        inputName: 'isXPContent',
        value: true
      })
    }

    if (item === '4.7-content') {
      dispatch({
        type: 'handle',
        inputName: 'isXPContent',
        value: false
      })
    }
  }

  function handleContentSelect(event) {
    dispatch({
      type: 'handle',
      inputName: 'selectedContentResult',
      value: event
    })
  }

  function handleDatoTypeSelect(type) {
    if (type === 'date-select-manual') {
      dispatch({
        type: 'handle',
        inputName: 'showDatePicker',
        value: true
      })
    } else {
      dispatch({
        type: 'set',
        setState: {
          ...formState,
          showDatePicker: false,
          startDateValue: type === 'date-select-xp' ? 'xp' : ''
        }
      })
    }
  }

  function handleInputChange(event, type) {
    dispatch({
      type: 'handle',
      inputName: type,
      value: event
    })
  }

  async function searchForTerm(inputValue = '') {
    const result = await axios.get(props.contentSearchServiceUrl, {
      params: {
        query: inputValue
      }
    })
    const hits = result.data.hits
    return hits
  }

  const promiseOptions = (inputValue) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(searchForTerm(inputValue))
      }, 1000)
    })

  const selectedContentType = props.contentTypes.filter((contentType) => formState.contentTypeValue === contentType.id)[0]
  const selectedMainSubject = props.mainSubjects.filter((mainSubject) => formState.mainSubjectValue === mainSubject.title)[0]
  const selectedEnglishMainSubject = props.mainSubjectsEnglish.filter((mainSubjectEnglish) => formState.englishMainSubjectValue === mainSubjectEnglish.title)[0]

  return (
    <div className="best-bet-form">
      <Row className="mb-3">
        <Col>
          <Tabs
            activeOnInit={formState.isXPContent ? 'xp-content' : '4.7-content'}
            items={[
              {
                title: 'Velg XP innhold',
                path: 'xp-content'
              },
              {
                title: 'Legg til 4.7. innhold',
                path: '4.7-content'
              }
            ]}
            onClick={handleTabOnClick}
          />
          <Divider />
        </Col>
      </Row>
      <Row className="d-flex flex-row align-items-end mb-3">
        <Col className="col-lg-10">
          <Input
            className="m-0"
            label="Best bet"
            handleChange={(e) => handleInputChange(e, 'searchWordTag')}
            value={formState.searchWordTag}
          />
        </Col>
        <Col className="d-flex justify-content-end">
          <Button primary onClick={() => props.handleTag('submit')}>Legg til</Button>
        </Col>
      </Row>
      {formState.searchWordsList.length ?
        <Row>
          <Col className="d-flex flex-wrap mb-3">
            {formState.searchWordsList.map((searchWord) => props.renderSearchWord(searchWord))}
          </Col>
        </Row> : null}
      <Row>
        <Col>
          {formState.isXPContent &&
                <div id="content-selector-dropdown" className="ssb-dropdown mb-3">
                  <label id="dropdown-label" htmlFor="react-select-3-input">Content selector</label>
                  <AsyncSelect
                    className="dropdown-interactive-area"
                    placeholder="Søk ved å skrive..."
                    styles={customAsyncSelectStyles}
                    defaultInputValue={formState.selectedContentResult && formState.selectedContentResult.label}
                    cacheOptions
                    defaultOptions
                    loadOptions={promiseOptions}
                    onChange={handleContentSelect} />
                </div>}
          {!formState.isXPContent &&
                <React.Fragment>
                  <Input
                    label="Ekstern lenke"
                    handleChange={(e) => handleInputChange(e, 'urlInputValue')}
                    value={formState.urlInputValue}
                  />
                  <Input
                    label="Tittel"
                    handleChange={(e) => handleInputChange(e, 'titleInputValue')}
                    value={formState.titleInputValue}
                  />
                </React.Fragment>}
          <TextArea
            label="Ingress"
            handleChange={(e) => handleInputChange(e, 'ingressInputValue')}
            value={formState.ingressInputValue}
          />
          <Dropdown
            header="Innholdstype"
            items={props.contentTypes}
            selectedItem={selectedContentType ? selectedContentType : props.contentTypes[0]}
            onSelect={(item) => handleInputChange(item.id !== '' ? item.id : '', 'contentTypeValue')}
          />
          <Dropdown
            header="Emne"
            items={props.mainSubjects}
            selectedItem={selectedMainSubject ? selectedMainSubject : props.mainSubjects[0]}
            onSelect={(item) => handleInputChange(item.id !== '' ? item.title : '', 'mainSubjectValue')}
          />
          <Dropdown
            header="Emne på engelsk"
            items={props.mainSubjectsEnglish}
            selectedItem={selectedEnglishMainSubject ? selectedEnglishMainSubject : props.mainSubjectsEnglish[0]}
            onSelect={(item) => handleInputChange(item.id !== '' ? item.title : '', 'englishMainSubjectValue')}
          />
          {formState.isXPContent &&
                <RadioGroup
                  header="Velg dato format"
                  onChange={handleDatoTypeSelect}
                  selectedValue={formState.startDateValue ?
                    formState.startDateValue === 'xp' ? 'date-select-xp' : 'date-select-manual' :
                    'date-select-none'}
                  orientation="column"
                  items={[
                    {
                      label: 'Manuell innføring',
                      value: 'date-select-manual'
                    },
                    {
                      label: 'Hent fra XP innhold',
                      value: 'date-select-xp'
                    },
                    {
                      label: 'Ingen dato',
                      value: 'date-select-none'
                    }
                  ]}
                />
          }
          {(!formState.isXPContent || formState.showDatePicker) &&
                <Input
                  label="Dato"
                  type="date"
                  handleChange={(e) => handleInputChange(e, 'startDateValue')}
                  value={formState.startDateValue}
                />}
        </Col>
      </Row>
    </div>
  )
}

BestBetForm.propTypes = {
  bestBetListServiceUrl: PropTypes.string,
  contentSearchServiceUrl: PropTypes.string,
  contentTypes: PropTypes.array,
  mainSubjects: PropTypes.array,
  mainSubjectsEnglish: PropTypes.array,
  renderSearchWord: PropTypes.func,
  handleTag: PropTypes.func
}

export default (props) => <BestBetForm {...props} />
