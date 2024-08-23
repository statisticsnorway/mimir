import React from 'react'
import { CategoryLink } from '@statisticsnorway/ssb-component-library'
import { type CategoryLinksProps } from '../../lib/types/partTypes/categoryLinks'

const CategoryLinks = (props: CategoryLinksProps) => {
  const { links, methodsAndDocumentationUrl, methodsAndDocumentationLabel } = props

  function addMethodAndDocumentation() {
    if (methodsAndDocumentationUrl && methodsAndDocumentationUrl !== '') {
      return (
        <div className='col-12 col-md-6 mb-4'>
          <CategoryLink
            href={methodsAndDocumentationUrl}
            titleText={methodsAndDocumentationLabel}
            className='method-and-documentation'
          />
        </div>
      )
    }
  }

  return (
    <div className='container'>
      <div className='row justify-content-start'>
        {links?.map((link, index) => {
          return (
            <div className='col-12 col-md-6 mb-4' key={index}>
              <CategoryLink href={link.href} titleText={link.titleText} subText={link.subText} />
            </div>
          )
        })}
        {addMethodAndDocumentation()}
      </div>
    </div>
  )
}

export default (props: CategoryLinksProps) => <CategoryLinks {...props} />
