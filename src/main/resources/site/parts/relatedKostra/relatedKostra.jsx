import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'

function createMarkup(html) {
  return {
    __html: html
  }
}

export default (props) =>
  <section className="container part-related-kostra border-top-green">
    <div className="row">
      <div className="col-12">
        <div className="text-center">
          <h2 className="roboto-condensed position-relative">{props.title}</h2>
          <div className="pt-1 pb-2 position-relative" dangerouslySetInnerHTML={createMarkup(props.description)}></div>
          <Link {...props} icon={<ArrowRight size="20" />} />
        </div>
      </div>
    </div>
  </section>
