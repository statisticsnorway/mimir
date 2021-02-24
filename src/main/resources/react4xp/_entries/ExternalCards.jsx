import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { ExternalLink } from 'react-feather'

const ExternalCards = (props) => {
  return (
    <React.Fragment>
      <div className="container">
        <div className="row justify-content-start">
          {props.links.map((link, index) => {
            return (
              <div className="col-4 mb-4" key={index}>
                <div className="external-card">
                  <img className="d-block mx-auto" src={link.image} alt=" "/>
                  <p className="text-center"
                    dangerouslySetInnerHTML={{
                      __html: link.content
                    }}
                  />
                  <div className="link-wrapper text-center">
                    <Link
                      href={link.href}
                      icon={<ExternalLink size="18"/>}
                      className=''
                      isExternal={true}
                    >
                      <span
                        dangerouslySetInnerHTML={{
                          __html: link.children
                        }}
                      />
                    </Link>
                  </div>
                </div>

              </div>
            )
          }
          )}
        </div>
      </div>
    </React.Fragment>
  )
}

ExternalCards.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.string,
      imageAlt: PropTypes.string,
      content: PropTypes.string,
      href: PropTypes.string.isRequired,
      children: PropTypes.string
    })
  )
}

export default ExternalCards
