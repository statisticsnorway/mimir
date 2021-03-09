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
      relatedContentLists, mainTitle, showAll, showLess
    } = this.props
    return (
      <div className="container">
        <h2>{mainTitle}</h2>
        <div className="row image-box-wrapper">
          {relatedContentLists.map((relatedRelatedContent, index) =>
            <PictureCard
              className={`mb-3 ${index > 3 && this.state.isHidden ? 'd-none' : ''}`}
              imageSrc={relatedRelatedContent.image}
              altText={relatedRelatedContent.imageAlt ? relatedRelatedContent.imageAlt : ' '}
              link={relatedRelatedContent.link}
              type={relatedRelatedContent.type ? relatedRelatedContent.type : undefined}
              title={relatedRelatedContent.title}
              key={index}
            />
          )}
        </div>
        <div className={`row hide-show-btn ${relatedContentLists.length < 5 ? 'd-none' : ''}`}>
          <div className="col-auto">
            <Button onClick={this.toggleBox}>{this.state.isHidden ? showAll : showLess}</Button>
          </div>
        </div>
      </div>
    )
  }
}

RelatedBoxes.propTypes = {
  relatedContentLists: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      type: PropTypes.string,
      image: PropTypes.string.isRequired,
      imageAlt: PropTypes.string
    })
  ).isRequired,
  showAll: PropTypes.string.isRequired,
  showLess: PropTypes.string.isRequired,
  mainTitle: PropTypes.string.isRequired
}

export default (props) => <RelatedBoxes {...props} />
