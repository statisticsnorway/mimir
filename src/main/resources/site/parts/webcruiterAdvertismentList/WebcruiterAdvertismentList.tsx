import React, { useState, useEffect } from 'react'

import { Title, Divider } from '@statisticsnorway/ssb-component-library'
import { NumericFormat } from 'react-number-format'

import { type WebcruiterAdvertismentListProps } from '/lib/types/partTypes/webcruiterAdvertismentList'

const WebcruiterAdvertistmentList = (props: WebcruiterAdvertismentListProps) => {
  const { title, showingPhrase } = props
  const [advertismentList, setAdvertismentList] = useState([])

  useEffect(() => {
    setAdvertismentList([])
  }, [])

  function renderAdvertismentList() {
    return <p className='text-center'>Ingen treff</p>
  }

  // TODO: Bootstrap classes? Consider using css classes instead so we don't have duplicate styling done in different ways for publicationArchive, subjectArticleList, searchResultView etc
  return (
    <div className='container'>
      <div className='row'>
        {title && (
          <Title className='col-12' size={2}>
            {title}
          </Title>
        )}
      </div>
      <div className='row justify-content-md-center'>
        <div className='col-md-6 col-12'>
          {showingPhrase?.replace('{0}', advertismentList.length.toString())}&nbsp;
          <NumericFormat value={Number(0)} displayType='text' thousandSeparator=' ' /> {/* TODO: Total */}
          <Divider />
          {renderAdvertismentList()}
        </div>
      </div>
    </div>
  )
}

export default (props: WebcruiterAdvertismentListProps) => <WebcruiterAdvertistmentList {...props} />
