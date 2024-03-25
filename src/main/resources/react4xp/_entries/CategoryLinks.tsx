import React from 'react'
import { CategoryLink } from '@statisticsnorway/ssb-component-library'
import { type CategoryLinksProps } from '../../lib/types/partTypes/categoryLinks'

class CategoryLinks extends React.Component<CategoryLinksProps> {
  constructor(props: CategoryLinksProps) {
    super(props)
  }

  render() {
    return (
      <React.Fragment>
        <div className='container'>
          <div className='row justify-content-start'>
            {this.props.links?.map((link, index) => {
              return (
                <div className='col-12 col-md-6 mb-4' key={index}>
                  <CategoryLink href={link.href} titleText={link.titleText} subText={link.subText} className='' />
                </div>
              )
            })}
            {this.addMethodAndDocumentation()}
          </div>
        </div>
      </React.Fragment>
    )
  }

  addMethodAndDocumentation() {
    const { methodsAndDocumentationUrl, methodsAndDocumentationLabel } = this.props
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
}

export default (props: CategoryLinksProps) => <CategoryLinks {...props} />
