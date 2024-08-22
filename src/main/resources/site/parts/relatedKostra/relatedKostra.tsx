import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'
import { sanitize } from '../../../lib/ssb/utils/htmlUtils'
import { RelatedKostraProps } from '../../../lib/types/partTypes/relatedKostra'

function RelatedKostra(props: RelatedKostraProps) {
  const { title, description, href, children, linkType } = props
  return (
    <section className='container part-related-kostra border-top-green'>
      <div className='row'>
        <div className='col-12'>
          <div className='text-center'>
            <h2 className='roboto-condensed position-relative'>{title}</h2>
            <div
              className='pt-1 pb-2 position-relative'
              dangerouslySetInnerHTML={{
                __html: sanitize(description),
              }}
            />
            <Link href={href} linkType={linkType} icon={<ArrowRight size='20' />}>
              {children}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RelatedKostra
