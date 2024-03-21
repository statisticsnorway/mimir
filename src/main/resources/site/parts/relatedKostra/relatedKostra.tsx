import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'
import { sanitize } from '../../../lib/ssb/utils/htmlUtils'
import { RelatedKostraProps } from '../../../lib/types/partTypes/relatedKostra'

class RelatedKostra extends React.Component<RelatedKostraProps> {
  constructor(props: RelatedKostraProps) {
    super(props)
  }

  createMarkup(html: string) {
    return {
      __html: sanitize(html),
    }
  }

  render() {
    return (
      <section className='container part-related-kostra border-top-green'>
        <div className='row'>
          <div className='col-12'>
            <div className='text-center'>
              <h2 className='roboto-condensed position-relative'>{this.props.title}</h2>
              <div
                className='pt-1 pb-2 position-relative'
                dangerouslySetInnerHTML={this.createMarkup(this.props.description)}
              ></div>
              <Link {...this.props} icon={<ArrowRight size='20' />} />
            </div>
          </div>
        </div>
      </section>
    )
  }
}

export default (props: RelatedKostraProps) => <RelatedKostra {...props} />
