import React from 'react'
import { Title, Divider, RadioGroup, Dropdown, Input, Button } from '@statisticsnorway/ssb-component-library'
import { Container, Row, Col, Form } from 'react-bootstrap'

import { BpiCalculatorProps } from '/lib/types/partTypes/bpiCalculator'

function BpiCalculator(props: BpiCalculatorProps) {
  const { phrases, nextPublishText } = props

  function addDropdownChooseQuarter(id: 'start-quarter' | 'end-quarter') {
    return (
      <Dropdown
        className='quarter'
        id={id}
        header={phrases.bpiChooseQuarterPeriod}
        onSelect={() => {}}
        error={''}
        errorMessage={''}
        selectedItem={{ id: `bpi-${id}`, title: phrases.bpiChooseQuarterPeriod }}
        items={[]}
      />
    )
  }

  // TODO: Check if it's possible to make this into a React template component that can be used by all calculators
  function renderForm() {
    return (
      <div className='calculator-form'>
        <Row>
          <Col>
            <Title size={2}>{phrases.bpiCalculatorTitle}</Title>
          </Col>
        </Row>
        <Row>
          <Col>
            <p className='publish-text'>{nextPublishText}</p>
          </Col>
        </Row>
        <Form onSubmit={() => {}}>
          <Container>
            <Row className='mt-5'>
              <Col className='col-12 col-lg-4'>
                <Title size={3}>{phrases.bpiChooseResidentialType}</Title>
                <RadioGroup onChange={() => {}} selectedValue='1' orientation='column' items={[]} />
              </Col>
              <Col className='col-12 col-lg-8'>
                <Title size={3}>{phrases.bpiChooseRegion}</Title>
                <Dropdown selectedItem={{ id: 'chooseRegion', title: phrases.bpiChooseRegion }} items={[]} />
              </Col>
            </Row>
            <Divider className='my-5' />
            {/* TODO: This part of the field is almost, if not, the same for all calculators */}
            <Row>
              <Col className='calculate-from col-12 col-lg-6'>
                <Title size={3}>{phrases.calculatePriceChangeFrom}</Title>
                <Container>
                  <Row>
                    <Col className='select-year col-sm-5'>
                      <Input
                        className='input-year'
                        label={phrases.fromYear}
                        ariaLabel={phrases.fromYearScreenReader}
                        handleChange={() => {}}
                        error={''}
                        errorMessage={''}
                        onBlur={() => {}}
                      />
                    </Col>
                    <Col className='select-month col-12 col-sm-7'>{addDropdownChooseQuarter('start-quarter')}</Col>
                  </Row>
                </Container>
              </Col>
              <Col className='calculate-to col-12 col-lg-6'>
                <Title size={3}>{phrases.calculatePriceChangeTo}</Title>
                <Container>
                  <Row>
                    <Col className='select-year col-sm-5'>
                      <Input
                        className='input-year'
                        label={phrases.toYear}
                        ariaLabel={phrases.toYearScreenReader}
                        handleChange={() => {}}
                        error={''}
                        errorMessage={''}
                        onBlur={() => {}}
                      />
                    </Col>
                    <Col className='select-month col-12 col-sm-7'>{addDropdownChooseQuarter('end-quarter')}</Col>
                  </Row>
                </Container>
              </Col>
            </Row>
          </Container>
        </Form>
        <Row className='submit'>
          <Col>
            <Button className='submit-button' primary type='submit'>
              {phrases.seePriceChange}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }

  return <Container className='content'>{renderForm()}</Container>
}

export default (props: BpiCalculatorProps) => <BpiCalculator {...props} />
