import React from 'react'
import { PictureCard, Button } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

class RelatedBoxes extends React.Component {
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
  };

  render() {
    const {
      relatedContents, mainTitle, showAll, showLess
    } = this.props
    return (
      <div className="container">
        <h2>{mainTitle}</h2>
        <div className="row image-box-wrapper">
          {relatedContents.map((relatedRelatedContent, index) =>
            <PictureCard
              className={`mb-3 ${index > 3 && this.state.isHidden ? 'd-none' : ''}`}
              imageSrc={relatedRelatedContent.image}
              altText={relatedRelatedContent.imageAlt ? relatedRelatedContent.imageAlt : ' '}
              link={relatedRelatedContent.link}
              title={relatedRelatedContent.title}
              key={index}
            />
          )}
        </div>
        <div className={`row hide-show-btn ${relatedContents.length < 5 ? 'd-none' : ''}`}>
          <div className="col-auto">
            <Button onClick={this.toggleBox}>{this.state.isHidden ? showAll : showLess}</Button>
          </div>
        </div>
      </div>
    )
  }
}

RelatedBoxes.propTypes = {
  relatedContents: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      imageAlt: PropTypes.string
    })
  ).isRequired,
  showAll: PropTypes.string.isRequired,
  showLess: PropTypes.string.isRequired,
  mainTitle: PropTypes.string.isRequired
}

export default (props) => <RelatedBoxes {...props} />
