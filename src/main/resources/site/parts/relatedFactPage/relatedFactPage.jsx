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
      <section className="xp-part part-image-link container col-12 mt-5">
        <h2 className={'ml-auto mr-auto pt-4'} >{mainTitle}</h2>
        <div className="image-box-wrapper pt-5">
          {relatedContentLists.map((relatedRelatedContent, index) =>
            <PictureCard
              className={index > 3 && this.state.isHidden ? 'd-none' : ''}
              image={<img src={relatedRelatedContent.image} alt={relatedRelatedContent.imageAlt}/>}
              link={relatedRelatedContent.link}
              type={relatedRelatedContent.type ? relatedRelatedContent.type : undefined}
              title={relatedRelatedContent.title}
              key={index}
            />
          )}
        </div>
        <div className="pb-5 hide-show-btn">
          <Button className={relatedContentLists.length < 5 ? 'd-none' : ''} onClick={this.toggleBox}>{this.state.isHidden ? showAll : showLess}</Button>
        </div>
      </section>
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
      imageAlt: PropTypes.string.isRequired
    })
  ).isRequired,
  showAll: PropTypes.string.isRequired,
  showLess: PropTypes.string.isRequired,
  mainTitle: PropTypes.string.isRequired
}

export default (props) => <RelatedBoxes {...props} />
