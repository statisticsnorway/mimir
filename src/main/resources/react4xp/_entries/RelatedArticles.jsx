import React from 'react'
import { Card, Text, Button } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

class RelatedArticles extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isHidden: true
    }

    this.toggleBox = this.toggleBox.bind(this)
  }

  toggleBox() {
    this.setState((prevState) => ({
      isHidden: !prevState.isHidden
    }))
  }

  getButtonBreakpoints() {
    const {
      relatedArticles
    } = this.props
    if (relatedArticles.length > 6) {
      return '' // always display if it's more than 6
    } else if (relatedArticles.length > 4) {
      return ' d-xl-none'
    } else if (relatedArticles.length > 3) {
      return ' d-lg-none'
    }
    return ' d-none' // always hide if there is less than 3
  }

  renderShowMoreButton() {
    const {
      showAll,
      showLess
    } = this.props
    return (
      <div className={`row hide-show-btn justify-content-center justify-content-lg-start${this.getButtonBreakpoints()}`}>
        <div className="col-auto">
          <Button onClick={this.toggleBox}>{this.state.isHidden ? showAll : showLess}</Button>
        </div>
      </div>
    )
  }

  getBreakpoints(index, hasButton) {
    const hideCard = hasButton && this.state.isHidden ? ' d-none' : ''
    if (index < 3) {
      return ' d-block'
    } else if (index < 4) {
      return ` d-lg-block${hideCard}`
    } else if (index < 6) {
      return ` d-lg-block${hideCard}`
    }
    return hideCard
  }

  render() {
    const {
      relatedArticles,
      heading,
      showAll,
      showLess
    } = this.props
    const hasButton = showAll && showLess
    return (
      <div className="container">
        <div className="row">
          <h2 className="col mt-4 mb-5">{heading}</h2>
        </div>
        <div className="row mb-5">
          {relatedArticles.map((article, index) => {
            return (
              <div
                key={index}
                className={`col-auto col-12 col-lg-4 mb-3${this.getBreakpoints(index, hasButton)}`}
              >
                <Card
                  imagePlacement="top"
                  image={
                    <img
                      src={article.imageSrc}
                      alt={article.imageAlt ? article.imageAlt : ' '} aria-hidden="true" />
                  }
                  href={article.href}
                  subTitle={article.subTitle}
                  title={article.title}
                >
                  <Text>
                    {article.preface}
                  </Text>
                </Card>
              </div>
            )
          })}
        </div>
        {hasButton && this.renderShowMoreButton()}
      </div>
    )
  }
}

RelatedArticles.propTypes = {
  relatedArticles: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      subTitle: PropTypes.string,
      preface: PropTypes.string,
      href: PropTypes.string.isRequired,
      imageSrc: PropTypes.string.isRequired,
      imageAlt: PropTypes.string
    })
  ).isRequired,
  showAll: PropTypes.string.isRequired,
  showLess: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired
}

export default (props) => <RelatedArticles {...props} />
